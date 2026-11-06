import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const runtimeRequire = createRequire(import.meta.url)
const { NextRequest } = runtimeRequire("next/server")
const testDirectory = path.dirname(fileURLToPath(import.meta.url))

// Load the actual TS modules with only Next's request cookie context mocked.
// No test server, backend account, or real tokens are needed.
function setup(t, values = {}) {
  const root = path.resolve(testDirectory, "..")
  const modules = new Map()
  const store = new Map(Object.entries(values))
  const originalFetch = global.fetch
  const originalBase = process.env.API_BASE_URL
  process.env.API_BASE_URL = "https://backend.example/api/v1"
  t.after(() => {
    global.fetch = originalFetch
    if (originalBase === undefined) delete process.env.API_BASE_URL
    else process.env.API_BASE_URL = originalBase
  })

  function load(filename) {
    const absolute = path.resolve(root, filename)
    if (modules.has(absolute)) return modules.get(absolute).exports
    const compiledModule = { exports: {} }
    modules.set(absolute, compiledModule)
    const source = ts.transpileModule(readFileSync(absolute, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
      fileName: absolute,
    }).outputText
    const localRequire = (name) => {
      if (name === "server-only") return {}
      if (name === "next/headers") {
        return { cookies: async () => ({ get: (key) => store.has(key) ? { value: store.get(key) } : undefined }) }
      }
      if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`)
      if (name.startsWith(".")) return load(`${path.resolve(path.dirname(absolute), name)}.ts`)
      return runtimeRequire(name)
    }
    new Function("require", "module", "exports", source)(localRequire, compiledModule, compiledModule.exports)
    return compiledModule.exports
  }

  return { load }
}

const tokens = { access_token: "new-access", refresh_token: "new-refresh", expires_in: 900 }
const json = (body, status = 200) => Response.json(body, { status })

test("staff PATCH forwards validated fields with the authenticated session", async (t) => {
  const { load } = setup(t, { access_token: "valid" })
  const values = { full_name: "Nguyễn Văn An", phone: "+84912345678", status: "suspended" }
  global.fetch = async (url, options) => {
    assert.equal(url, "https://backend.example/api/v1/admin/staff/42")
    assert.equal(options.method, "PATCH")
    assert.equal(options.headers.Authorization, "Bearer valid")
    assert.deepEqual(JSON.parse(options.body), values)
    return new Response(null, { status: 204 })
  }
  const response = await load("app/api/admin/staff/[id]/route.ts").PATCH(
    new Request("https://frontend.example/api/admin/staff/42", {
      method: "PATCH", body: JSON.stringify({ ...values, email: "ignored@example.com", role_id: 1 }),
    }),
    { params: Promise.resolve({ id: "42" }) },
  )
  assert.equal(response.status, 204)
  assert.equal(response.headers.get("Cache-Control"), "no-store")
})

test("staff PATCH rejects invalid IDs and payloads before calling backend", async (t) => {
  const { load } = setup(t, { access_token: "valid" })
  global.fetch = () => assert.fail("invalid requests must not reach backend")
  const { PATCH } = load("app/api/admin/staff/[id]/route.ts")
  for (const [id, body] of [
    ["0", { full_name: "An" }], ["../roles", { full_name: "An" }],
    ["9223372036854775808", { full_name: "An" }],
    ["42", {}], ["42", { email: "unsupported@example.com" }],
    ["42", { full_name: "  " }], ["42", { phone: "invalid" }],
    ["42", { status: "locked" }], ["42", null],
  ]) {
    const response = await PATCH(new Request("https://frontend.example/api/admin/staff/42", {
      method: "PATCH", body: JSON.stringify(body),
    }), { params: Promise.resolve({ id }) })
    assert.equal(response.status, 400, JSON.stringify({ id, body }))
  }
})

test("staff update client accepts empty success and exposes API errors", async (t) => {
  const { load } = setup(t)
  const { updateStaff, StaffApiError } = load("lib/api/staff/client.ts")
  const values = { full_name: "An", phone: "0912345678", status: "active" }
  global.fetch = async (url, options) => {
    assert.equal(url, "/api/admin/staff/42")
    assert.equal(options.method, "PATCH")
    assert.deepEqual(JSON.parse(options.body), values)
    return new Response(null, { status: 204 })
  }
  await updateStaff("42", values)
  for (const status of [401, 403, 404, 409, 422, 502]) {
    global.fetch = async () => json({}, status)
    await assert.rejects(updateStaff("42", values), (error) => error instanceof StaffApiError && error.status === status)
  }
})

function assertCleared(response) {
  for (const key of ["access_token", "refresh_token", "app_role", "remember_session"]) {
    assert.equal(response.cookies.get(key)?.maxAge, 0, key)
  }
}

test("valid access token calls the API without refreshing", async (t) => {
  const { load } = setup(t, { access_token: "valid" })
  global.fetch = async (url, options) => {
    assert.equal(url, "https://backend.example/api/v1/admin/staff")
    assert.equal(options.headers.Authorization, "Bearer valid")
    return json({ items: [] })
  }
  const response = await load("lib/api/backend.ts").proxy("/admin/staff", "GET")
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("set-cookie"), null)
})

test("missing access token refreshes, rotates cookies and preserves remember", async (t) => {
  const { load } = setup(t, { refresh_token: "old-refresh", remember_session: "1" })
  const calls = []
  global.fetch = async (url, options) => {
    calls.push(url)
    if (url.endsWith("/auth/refresh")) {
      assert.equal(options.method, "POST")
      assert.deepEqual(JSON.parse(options.body), { refresh_token: "old-refresh" })
      return json(tokens)
    }
    assert.equal(options.headers.Authorization, "Bearer new-access")
    return json({ items: [] })
  }
  const response = await load("lib/api/backend.ts").proxy("/admin/staff", "GET")
  assert.equal(calls.length, 2)
  assert.equal(response.cookies.get("access_token").value, "new-access")
  assert.equal(response.cookies.get("access_token").maxAge, 900)
  assert.equal(response.cookies.get("refresh_token").value, "new-refresh")
  assert.equal(response.cookies.get("refresh_token").maxAge, 2592000)
  assert.equal(response.cookies.get("access_token").httpOnly, true)
})

test("401 refreshes and retries a mutation exactly once with the same body", async (t) => {
  const { load } = setup(t, { access_token: "expired", refresh_token: "refresh" })
  const calls = []
  global.fetch = async (url, options) => {
    calls.push({ url, options })
    if (url.endsWith("/auth/refresh")) return json(tokens)
    return options.headers.Authorization === "Bearer expired" ? json({}, 401) : json({ id: 1 }, 201)
  }
  const response = await load("lib/api/backend.ts").proxy("/admin/staff", "POST", { name: "Test" })
  assert.equal(response.status, 201)
  assert.equal(calls.length, 3)
  assert.equal(calls[0].options.body, calls[2].options.body)
  assert.equal(response.cookies.get("refresh_token").maxAge, undefined)
})

test("a second 401 clears the session without another refresh", async (t) => {
  const { load } = setup(t, { access_token: "expired", refresh_token: "refresh" })
  let calls = 0
  global.fetch = async (url) => {
    calls++
    return url.endsWith("/auth/refresh") ? json(tokens) : json({}, 401)
  }
  const response = await load("lib/api/backend.ts").proxy("/admin/staff", "GET")
  assert.equal(response.status, 401)
  assert.equal(calls, 3)
  assertCleared(response)
})

test("a rejected refresh token clears cookies and returns 401", async (t) => {
  const { load } = setup(t, { refresh_token: "revoked" })
  global.fetch = async () => json({}, 401)
  const response = await load("lib/api/backend.ts").proxy("/admin/staff", "GET")
  assert.equal(response.status, 401)
  assertCleared(response)
})

test("network, server and malformed refresh responses preserve cookies", async (t) => {
  const { load } = setup(t, { refresh_token: "refresh" })
  const { proxy } = load("lib/api/backend.ts")
  for (const result of [new Error("offline"), json({}, 503), json({ access_token: "bad" })]) {
    global.fetch = async () => {
      if (result instanceof Error) throw result
      return result
    }
    const response = await proxy("/admin/staff", "GET")
    assert.equal(response.status, 502)
    assert.equal(response.headers.get("set-cookie"), null)
  }
})

test("permission and validation errors do not trigger refresh", async (t) => {
  const { load } = setup(t, { access_token: "valid", refresh_token: "refresh" })
  for (const status of [403, 422]) {
    global.fetch = async (url) => {
      assert.ok(!url.endsWith("/auth/refresh"))
      return json({}, status)
    }
    assert.equal((await load("lib/api/backend.ts").proxy("/admin/staff", "GET")).status, status)
  }
})

test("overlapping refreshes share one backend call", async (t) => {
  const { load } = setup(t)
  let calls = 0
  let complete
  global.fetch = () => {
    calls++
    return new Promise((resolve) => { complete = resolve })
  }
  const { refreshSession } = load("lib/auth/refresh.ts")
  const first = refreshSession("same-token")
  const second = refreshSession("same-token")
  assert.equal(calls, 1)
  complete(json(tokens))
  assert.deepEqual(await first, tokens)
  assert.deepEqual(await second, tokens)
})

test("refresh endpoint keeps tokens HttpOnly and supports non-rotating backends", async (t) => {
  const { load } = setup(t, { refresh_token: "original" })
  global.fetch = async () => json({ access_token: "new", expires_in: 900 })
  const response = await load("app/api/auth/refresh/route.ts").POST()
  assert.deepEqual(await response.json(), { success: true })
  assert.equal(response.cookies.get("refresh_token").value, "original")
  assert.equal(response.cookies.get("access_token").httpOnly, true)
})

test("missing session returns 401 and clears cookies without calling backend", async (t) => {
  const { load } = setup(t)
  global.fetch = () => assert.fail("must not call backend")
  assertCleared(await load("app/api/auth/refresh/route.ts").POST())
  const response = await load("lib/api/backend.ts").proxy("/admin/staff", "GET")
  assert.equal(response.status, 401)
  assertCleared(response)
})

test("page navigation refreshes and forwards new cookies to server rendering", async (t) => {
  const { load } = setup(t)
  global.fetch = async () => json(tokens)
  const request = new NextRequest("https://app.example/admin/operators", {
    headers: { cookie: "refresh_token=old; app_role=admin" },
  })
  const response = await load("proxy.ts").proxy(request)
  assert.equal(response.headers.get("location"), null)
  assert.equal(response.cookies.get("access_token").value, "new-access")
  assert.match(response.headers.get("x-middleware-request-cookie"), /access_token=new-access/)
})

test("login remains accessible with a refresh cookie without contacting the backend", async (t) => {
  const { load } = setup(t)
  global.fetch = () => assert.fail("login must not wait for refresh")
  const request = new NextRequest("https://app.example/login", {
    headers: { cookie: "refresh_token=old; app_role=admin" },
  })
  const response = await load("proxy.ts").proxy(request)
  assert.equal(response.headers.get("x-middleware-next"), "1")
  assert.equal(response.headers.get("location"), null)
  assert.equal(response.headers.get("set-cookie"), null)
})

test("invalid refresh redirects protected pages to login and clears cookies", async (t) => {
  const { load } = setup(t)
  global.fetch = async () => json({}, 401)
  for (const pathname of ["/admin/operators", "/operator"]) {
    const request = new NextRequest(`https://app.example${pathname}`, {
      headers: { cookie: "refresh_token=expired; app_role=admin" },
    })
    const response = await load("proxy.ts").proxy(request)
    assert.equal(response.headers.get("location"), "https://app.example/login")
    assertCleared(response)
  }
})

test("temporary refresh failures redirect to a reachable login without clearing cookies", async (t) => {
  const { load } = setup(t)
  const { proxy } = load("proxy.ts")
  for (const failure of [new Error("connection refused"), json({}, 503), json({}, 429)]) {
    let calls = 0
    global.fetch = async () => {
      calls++
      if (failure instanceof Error) throw failure
      return failure
    }
    const options = { headers: { cookie: "refresh_token=old; app_role=admin" } }
    const response = await proxy(new NextRequest("https://app.example/admin", options))
    assert.equal(response.headers.get("location"), "https://app.example/login")
    assert.equal(response.headers.get("set-cookie"), null)
    const login = await proxy(new NextRequest(response.headers.get("location"), options))
    assert.equal(login.headers.get("x-middleware-next"), "1")
    assert.equal(login.headers.get("location"), null)
    assert.equal(calls, 1)
  }
})

test("logout clears all session cookies including remember", async (t) => {
  const { load } = setup(t)
  assertCleared(await load("app/api/auth/logout/route.ts").POST())
})

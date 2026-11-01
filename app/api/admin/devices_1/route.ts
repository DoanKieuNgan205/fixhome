import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, code, name } = body;

    const authHeader = request.headers.get('Authorization') || '';

    // Gọi lên backend Render từ phía server Next.js để tránh tuyệt đối lỗi CORS
    const backendRes = await fetch(
      `https://fixhome-backend-1xly.onrender.com/api/v1/admin/catalog/categories/${categoryId}/device-types`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ code, name }),
      }
    );

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message || 'Lỗi từ server backend' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Lỗi kết nối server' },
      { status: 500 }
    );
  }
}
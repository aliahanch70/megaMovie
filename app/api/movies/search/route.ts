// app/api/movies/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'fc1ee60fdfmsh6fdd4275ed2ef95p1cd056jsn2795d6ac23ba',
      'x-rapidapi-host': 'imdb236.p.rapidapi.com',
    },
  };

  const url = `https://imdb236.p.rapidapi.com/imdb/search?originalTitle=${encodeURIComponent(query)}&rows=15&sortOrder=DESC&sortField=numVotes`;
  console.log('Requesting URL:', url);

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    // console.log('Raw API response:', text);

    if (!response.ok) {
      throw new Error(`Failed to fetch movie data: ${response.status} ${response.statusText}`);
    }

    const data = JSON.parse(text);
    // console.log('Parsed API response:', data);

    // بررسی ساختار داده و ارسال آرایه نتایج
    const results = data.data || data.results || data || []; // تطبیق با ساختارهای مختلف
    // console.log('Results to send:', results);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error fetching movie data:', error);
    return NextResponse.json({ error: 'Failed to fetch movie data', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}



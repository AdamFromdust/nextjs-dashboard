import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function supabaseSetup1() {
  // Create the table if it doesn't exist
  await sql`
    create table if not exists notes (
      id bigint primary key generated always as identity,
      title text not null
    );
  `;

  // Insert sample data
  await sql`
    insert into notes (title)
    values
      ('Today I created a Supabase project.'),
      ('I added some data and queried it from Next.js.'),
      ('It was awesome!')
    on conflict do nothing;
  `;

  // Enable row level security
  await sql`alter table notes enable row level security;`;

  // Optionally, return all notes
  const data = await sql`select * from notes;`;
  return data;
}


async function supabaseSetup2() {
  // Add RLS policy for public read access
  await sql`
    drop policy if exists "public can read notes" on public.notes;
  `;
  await sql`
    create policy "public can read notes"
    on public.notes
    for select
    to anon
    using (true);
  `;
  // Return all notes after setting the policy
  const data = await sql`select * from notes;`;
  return data;
}

export async function GET() {
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
  	return Response.json(await supabaseSetup2());
  } catch (error) {
  	return Response.json({ error }, { status: 500 });
  }
}

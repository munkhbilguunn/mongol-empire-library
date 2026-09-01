import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/PublicHeader";

function getAuthorName(author: any) {
  return (
    author.name_mn ||
    author.name ||
    author.name_en ||
    "Нэргүй зохиогч"
  );
}

function getAuthorPhotoUrl(photoPath: string | null) {
  if (!photoPath) return "";

  return supabase.storage
    .from("author-photos")
    .getPublicUrl(photoPath).data.publicUrl;
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default async function AuthorsPage() {
  const { data: authors, error } = await supabase
    .from("authors")
    .select(`
      id,
      name,
      name_mn,
      name_en,
      slug,
      birth_year,
      death_year,
      biography,
      photo_path,
      book_authors (
        book_id
      )
    `)
    .order("name");

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <PublicHeader active="authors" />

      <section className="border-b border-[#d9d0c0] bg-[#fffdf8] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
            Authors
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Зохиогч, судлаачид
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#766d61]">
            Монголын эзэнт гүрний түүхийн сан дахь зохиогч, судлаачдын
            бүртгэл болон тэдний бүтээлүүд.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Зохиогчдын мэдээлэл татахад алдаа гарлаа: {error.message}
            </div>
          ) : authors && authors.length > 0 ? (
            <>
              <div className="mb-8 text-sm text-[#766d61]">
                Нийт {authors.length} зохиогч
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {authors.map((author: any) => {
                  const name = getAuthorName(author);
                  const bookCount = author.book_authors?.length || 0;
                  const photoUrl = getAuthorPhotoUrl(author.photo_path);

                  return (
                    <article
                      key={author.id}
                      className="overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex gap-5 p-6">
                        {photoUrl ? (
                          <a
                            href={author.slug ? `/authors/${author.slug}` : "#"}
                            className="shrink-0"
                          >
                            <img
                              src={photoUrl}
                              alt={`${name} зураг`}
                              className="h-24 w-24 rounded-2xl object-cover object-top"
                            />
                          </a>
                        ) : (
                          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-[#d9d0c0] bg-[#eee8dc] text-3xl font-semibold text-[#9a6b25]">
                            {getInitial(name)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          {author.slug ? (
                            <a href={`/authors/${author.slug}`} className="group block">
                              <h2 className="text-xl font-semibold tracking-tight transition group-hover:text-[#9a6b25]">
                                {name}
                              </h2>
                            </a>
                          ) : (
                            <h2 className="text-xl font-semibold tracking-tight">
                              {name}
                            </h2>
                          )}

                          {(author.birth_year || author.death_year) && (
                            <p className="mt-2 text-xs text-[#8c8376]">
                              {author.birth_year || "?"}
                              {" — "}
                              {author.death_year || ""}
                            </p>
                          )}

                          {author.biography && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#766d61]">
                              {author.biography}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mx-6 flex items-center justify-between border-t border-[#e4ddd1] py-4 text-xs">
                        <span className="text-[#766d61]">
                          {bookCount} бүтээл
                        </span>

                        {author.slug && (
                          <a
                            href={`/authors/${author.slug}`}
                            className="font-medium text-[#8b672f] hover:underline"
                          >
                            Дэлгэрэнгүй →
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-10 text-center text-sm text-[#766d61]">
              Одоогоор зохиогч бүртгэгдээгүй байна.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

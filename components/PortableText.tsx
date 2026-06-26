import { PortableText as SanityPortableText } from "@portabletext/react";
import type { PortableTextComponents, PortableTextBlock } from "@portabletext/react";
import { urlFor } from "@/sanity/imageUrl";
import { isExternalHref, toInternalHref } from "@/lib/links";

type SanityImageValue = {
  asset?: { _ref?: string; url?: string };
  alt?: string;
  caption?: string;
};

function renderBodyImage({ value }: { value: SanityImageValue }) {
  const src = value?.asset?._ref
    ? urlFor(value).width(1200).fit("max").auto("format").url()
    : value?.asset?.url || "";
  if (!src) return null;
  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={value.alt || ""} className="rounded-lg w-full" />
      {value.caption && (
        <figcaption className="text-sm text-white/40 mt-2 text-center">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mt-12 mb-4 text-white">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mt-10 mb-4 text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold mt-8 mb-3 text-white">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold mt-6 mb-2 text-white">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="text-white/70 leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#625DF5] pl-4 my-6 text-white/60 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1 text-white/70">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1 text-white/70">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="text-white/70">{children}</li>
    ),
    number: ({ children }) => (
      <li className="text-white/70">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const isExternal = isExternalHref(value?.href);
      const normalizedHref = toInternalHref(value?.href);
      return (
        <a
          href={normalizedHref}
          className="text-[#A89BFF] hover:underline"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    code: ({ value }) => (
      <pre className="bg-white/5 border border-white/10 rounded-lg p-4 my-6 overflow-x-auto">
        <code className="text-sm font-mono text-white/80">{value.code}</code>
      </pre>
    ),
    image: renderBodyImage,
    blogBodyImage: renderBodyImage,
    table: ({ value }) => {
      const rows = (value?.rows ?? []) as Array<{ _key?: string; cells?: string[] }>;
      if (rows.length === 0) return null;
      const [headerRow, ...bodyRows] = rows;
      return (
        <div className="my-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm text-white/70">
            {headerRow?.cells && (
              <thead>
                <tr>
                  {headerRow.cells.map((cell, i) => (
                    <th
                      key={i}
                      className="border-b border-white/20 px-4 py-2 text-left font-semibold text-white"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, rowIdx) => (
                <tr key={row._key ?? rowIdx}>
                  {(row.cells ?? []).map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="border-b border-white/10 px-4 py-2 align-top"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  },
};

export function PortableTextRenderer({ value }: { value: PortableTextBlock[] }) {
  return <SanityPortableText value={value} components={components} />;
}

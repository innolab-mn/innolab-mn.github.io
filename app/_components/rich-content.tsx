import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";

import { DISPLAY } from "@/app/_components/ui";

// Renders Contentful rich text in the landing template's type scale.
export default function RichContent({ content }: { content: any }) {
  if (!content?.json) return null;
  const assets: any[] = content.links?.assets?.block ?? [];
  const entries: any[] = content.links?.entries?.block ?? [];

  return (
    <div className="text-base sm:text-lg text-black/70 leading-relaxed">
      {documentToReactComponents(content.json, {
        renderMark: {
          // Contentful headings are often bolded by hand; keep them in the light display weight.
          [MARKS.BOLD]: (text) => <strong className="font-semibold text-[#12281A] [h2_&]:font-light [h3_&]:font-light">{text}</strong>,
          [MARKS.ITALIC]: (text) => <em>{text}</em>,
          [MARKS.CODE]: (text) => <code className="text-sm bg-black/5 rounded px-1.5 py-0.5">{text}</code>,
        },
        renderNode: {
          [BLOCKS.HEADING_1]: (_, children) => (
            <h2 className={`${DISPLAY} text-3xl sm:text-4xl font-light tracking-tighter text-[#12281A] mt-16 mb-6 first:mt-0`}>{children}</h2>
          ),
          [BLOCKS.HEADING_2]: (_, children) => (
            <h2 className={`${DISPLAY} text-3xl sm:text-4xl font-light tracking-tighter text-[#12281A] mt-16 mb-6 first:mt-0`}>{children}</h2>
          ),
          [BLOCKS.HEADING_3]: (_, children) => (
            <h3 className={`${DISPLAY} text-xl sm:text-2xl font-light tracking-tighter text-[#12281A] mt-10 mb-4 first:mt-0`}>{children}</h3>
          ),
          [BLOCKS.HEADING_4]: (_, children) => <h4 className="font-semibold text-[#12281A] mt-8 mb-3">{children}</h4>,
          [BLOCKS.PARAGRAPH]: (_, children) => <p className="my-4 whitespace-pre-line [li_&]:my-0">{children}</p>,
          [BLOCKS.UL_LIST]: (_, children) => <ul className="my-5 space-y-2.5">{children}</ul>,
          [BLOCKS.OL_LIST]: (_, children) => <ol className="my-5 space-y-2.5 list-decimal pl-6 marker:text-[#42A85D]">{children}</ol>,
          [BLOCKS.LIST_ITEM]: (_, children) => (
            <li className="relative pl-6 [ol_&]:pl-1 before:absolute before:left-0 before:top-[0.7em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#42A85D] [ol_&]:before:hidden">
              {children}
            </li>
          ),
          [BLOCKS.HR]: () => <hr className="my-12 border-black/10" />,
          [BLOCKS.QUOTE]: (_, children) => (
            <blockquote className={`${DISPLAY} my-8 border-l-2 border-[#42A85D] pl-6 text-xl font-light tracking-tight text-[#12281A]`}>{children}</blockquote>
          ),
          [INLINES.HYPERLINK]: (node, children) => (
            <a href={node.data.uri} target="_blank" rel="noopener noreferrer" className="text-[#1E4D33] border-b border-[#1E4D33]/30 hover:border-[#1E4D33] transition-colors">
              {children}
            </a>
          ),
          [BLOCKS.EMBEDDED_ASSET]: (node) => {
            const asset = assets.find((a) => a.sys.id === node.data.target.sys.id);
            if (!asset?.url) return null;
            return (
              <figure className="my-10 rounded-2xl overflow-hidden shadow-xl shadow-black/10">
                <img src={asset.url} alt={asset.description || ""} className="w-full h-auto" />
              </figure>
            );
          },
          [BLOCKS.EMBEDDED_ENTRY]: (node) => {
            const videoId = entries.find((e) => e.sys.id === node.data.target.sys.id)?.videoId;
            if (!videoId) return null;
            return (
              <div className="my-10 relative w-full pb-[56.25%] overflow-hidden rounded-2xl shadow-2xl shadow-black/15 bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          },
        },
      })}
    </div>
  );
}

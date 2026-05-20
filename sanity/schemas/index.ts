import { placeholder } from "./placeholder";
import { author } from "./author";
import { blogPost, blogBodyImage } from "./blogPost";
import { linkAnnotation } from "./shared/linkAnnotation";

export const schemaTypes = [
  // Documents
  placeholder,
  author,
  blogPost,

  // Inline annotations (must be top-level so the Portable Text editor
  // can dereference `_type: "link"` in body content).
  linkAnnotation,

  // Per-type sub-schemas
  blogBodyImage,
];

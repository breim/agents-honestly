import { createCn } from 'cnfast';

/** Only Tailwind's own scale is recognised as a font size, so the book's `text-note` and its
    siblings fall through to the text-color group and knock the real color out: a shadcn
    Button handed `text-note` loses `text-primary-foreground` and renders white on white.
    Registering the scale here puts those utilities back in the font-size group. */
export const cn = createCn({
  extend: {
    theme: {
      text: ['display', 'title', 'headline', 'body', 'note', 'caption'],
    },
  },
});

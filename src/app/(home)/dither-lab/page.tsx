import type { Metadata } from 'next';
import Link from 'next/link';
import { appName } from '@/lib/shared';
import { BayerField, BayerRamp, BayerStrip, BayerWash } from './bayer';
import { curveWalks, errorDiffusionKernels, orderedScreens, RampPlate } from './catalog';
import { applications } from './applications';
import { faviconEntries, FaviconPlate } from './favicons';
import { formEntries, FormPlate } from './forms';
import { compositeEntries, paletteEntries, PalettePlate } from './palette';
import { matrixSizes, pixelScales, ScaleCell } from './scales';
import { washVariants } from './washes';

export const metadata: Metadata = {
  title: `Dither Lab · ${appName}`,
  description:
    "Every dithering technique this project's landing page has used, plus twenty more it never did.",
  robots: { index: false },
};

function Specimen({
  children,
  context,
  description,
  name,
}: {
  children: React.ReactNode;
  context: string;
  description: string;
  name: string;
}) {
  return (
    <section className="border-b border-rule py-10 first:pt-0 last:border-b-0">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16">
        <div>
          <h2 className="text-headline">{name}</h2>
          <p className="mt-2 max-w-[46ch] text-body text-quiet text-pretty">{description}</p>
          <p className="mt-3 text-caption text-quiet">{context}</p>
        </div>
        <div className="landing-panel overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

function Shelf({
  children,
  count,
  note,
  title,
  unit = 'technique',
}: {
  children: React.ReactNode;
  count: number;
  note: string;
  title: string;
  unit?: string;
}) {
  return (
    <section className="mt-20 border-t border-rule pt-10">
      <p className="text-caption text-quiet tabular-nums">
        {count} {count === 1 ? unit : `${unit}s`}
      </p>
      <h2 className="mt-2 text-title text-balance">{title}</h2>
      <p className="mt-4 max-w-[62ch] text-body text-quiet text-pretty">{note}</p>
      <ul className="mt-10">{children}</ul>
    </section>
  );
}

function Row({
  children,
  name,
  note,
  spec,
}: {
  children: React.ReactNode;
  name: string;
  note: string;
  spec: string;
}) {
  return (
    <li className="border-b border-rule py-8 first:pt-0 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-headline">{name}</h3>
        <span className="text-caption text-quiet">{spec}</span>
      </div>
      <p className="mt-2 max-w-[62ch] text-note text-quiet text-pretty">{note}</p>
      <div className="landing-panel mt-5 overflow-hidden p-4">{children}</div>
    </li>
  );
}

export default function DitherLabPage() {
  return (
    <main className="landing flex-1">
      <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
        <Link className="landing-quiet-link" href="/">
          &larr; Back home
        </Link>

        <h1 className="landing-rise mt-8 text-title text-balance">Dither Lab</h1>
        <p className="mt-5 max-w-[60ch] text-body text-quiet text-pretty">
          Not part of the book. The landing page has gone through a Bayer-dithered hero, a
          full dither system (ramps, flat fields, a calibration strip), and now a flat
          black-and-white console — dropping the dither along with the color. This page keeps
          every technique alive in one place, by name, since none of it ships anymore.
        </p>
        <p className="mt-4 max-w-[60ch] text-note text-quiet text-pretty">
          Only <strong className="font-semibold text-ink">Bayer Wash</strong> ever reached a
          commit (<code className="text-caption">b26658a</code>). The other four were
          built and used on this branch without ever being committed, then removed when the
          landing page moved on &mdash; reconstructed here from that working tree.
        </p>
        <p className="mt-4 max-w-[60ch] text-note text-quiet text-pretty">
          Below the archive, twenty more this project has never used at all &mdash; the rest of
          the family, printed here so the five above have something to be measured against.
          Each of the twenty prints the same source: a flat ramp from bare page to solid ink.
          Nothing in those plates comes from the picture, because there is no picture. It is
          all algorithm.
        </p>
        <p className="mt-4 max-w-[60ch] text-note text-quiet text-pretty">
          Then ten <strong className="font-semibold text-ink">forms</strong>, because a dither
          is not only a texture laid over a picture: hand the same matrix a field with a shape
          in it and the dots become the only thing drawing. Nothing in that section is an
          image, a gradient, or a blur.
        </p>
        <p className="mt-4 max-w-[60ch] text-note text-quiet text-pretty">
          And last, eight <strong className="font-semibold text-ink">wash variants</strong>
          &mdash; Bayer Wash itself, which builds its shape a different way from all of them,
          turned in every direction it turns. It is one hero background that turns out to be a
          family, including the sphere everybody has been shipping since 2023.
        </p>

        <div className="mt-14">
          <Specimen
            context="commit b26658a — the very first hero, full-bleed behind the whole page at 12–16% opacity"
            description="A radial gradient cut through the Bayer matrix cell by cell, so a soft glow is built entirely out of the same sixteen dot positions instead of a blurred gradient. Shown here at full strength; it shipped nearly invisible."
            name="Bayer Wash"
          >
            <BayerWash className="h-56 w-full text-ink" id="archive" />
          </Specimen>

          <Specimen
            context="the printed-ledger hero — a decorative print band fading in from the page edge"
            description="Ink laid across the field in visible steps rather than a continuum: densest at one edge, stepping down toward bare page as it approaches the reading column."
            name="Hero Ramp"
          >
            <BayerRamp className="h-40 w-full text-ink" dense="right" floor={0} id="lab-ramp" peak={7} steps={6} />
          </Specimen>

          <Specimen
            context="the &ldquo;same loop, under load&rdquo; section — one chip per production-load row"
            description="A flat field held at one of seventeen tones — a numberless gauge for how much heavier production got, from nearly bare paper to solid ink."
            name="Load Meter"
          >
            <div className="flex flex-wrap items-end gap-8 p-8">
              {[3, 7, 11, 16].map((level) => (
                <div key={level}>
                  <div className="size-16 border border-rule text-ink">
                    <BayerField className="size-full" id={`lab-load-${level}`} level={level} />
                  </div>
                  <p className="mt-2 text-center text-caption text-quiet tabular-nums">{level}/16</p>
                </div>
              ))}
            </div>
          </Specimen>

          <Specimen
            context="the journal's step list — marked a call that never ran"
            description="A single sparse tile at a finer cell size, standing in for the step a run's journal never recorded, next to solid ink for the steps that did."
            name="Journal Stamp"
          >
            <div className="flex items-center gap-4 p-8">
              <div className="size-10 text-ink">
                <BayerField cell={4} className="size-full" id="lab-stamp" level={8} />
              </div>
              <p className="text-caption text-quiet">8/16, 4px cell</p>
            </div>
          </Specimen>

          <Specimen
            context="the footer colophon — every tone the site ever printed, in one strip"
            description="All seventeen tones side by side, bare paper to solid ink: the calibration strip a print shop runs along the edge of a sheet to prove the press is honest."
            name="Colophon Strip"
          >
            <div className="overflow-x-auto p-8">
              <BayerStrip className="h-8 w-auto min-w-full text-ink" id="lab-strip" />
            </div>
          </Specimen>
        </div>

        <Shelf
          count={orderedScreens.length}
          note="A threshold for every position, and a comparison. No screen here looks at its neighbours, which is why they cost nothing, tile forever, and can be run on a pixel in isolation — and why every one of them leaves a texture of its own on a picture that had none."
          title="Ordered screens"
        >
          {orderedScreens.map(({ dither, ...entry }) => (
            <Row key={entry.name} {...entry}>
              <RampPlate dither={dither} />
            </Row>
          ))}
        </Shelf>

        <section className="mt-20 border-t border-rule pt-10">
          <p className="text-caption text-quiet">two axes</p>
          <h2 className="mt-2 text-title text-balance">Matrix size and pixel scale</h2>
          <p className="mt-4 max-w-[62ch] text-body text-quiet text-pretty">
            These get mistaken for each other constantly, and they are not related. Matrix size
            is how many tones a screen can hold &mdash; 2×2 holds five, 16×16 holds two hundred
            and fifty-seven. Pixel scale is how big one cell lands on the display. A 16×16
            matrix at four times the cell size still holds every one of its tones and still
            reads as blocks.
          </p>
          <p className="mt-4 max-w-[62ch] text-body text-quiet text-pretty">
            Read down a column to see tone count change with the texture held still. Read across
            a row to see the opposite. The bottom right is the one worth sitting with: all the
            tones in the world, and none of them survive the cell being that big.
          </p>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-separate border-spacing-2">
              <thead>
                <tr>
                  <th className="w-16" />
                  {pixelScales.map((scale) => (
                    <th className="text-caption font-normal text-quiet" key={scale}>
                      {scale}× cell
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixSizes.map((size) => (
                  <tr key={size}>
                    <th className="text-right align-middle text-caption font-normal text-quiet">
                      {size}×{size}
                    </th>
                    {pixelScales.map((scale) => (
                      <td className="landing-panel overflow-hidden p-1" key={scale}>
                        <ScaleCell scale={scale} size={size} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Shelf
          count={errorDiffusionKernels.length}
          note="Print the nearest tone you can, measure how far off that was, and hand the difference to cells you have not decided yet. The error never disappears; it only moves somewhere it will be less visible. These eight differ in where they push it and how much they admit to."
          title="Error diffusion"
        >
          {errorDiffusionKernels.map(({ dither, ...entry }) => (
            <Row key={entry.name} {...entry}>
              <RampPlate dither={dither} />
            </Row>
          ))}
        </Shelf>

        <Shelf
          count={curveWalks.length}
          note="The third answer, and the rarest: keep error diffusion, but take away the scan line it diffuses along."
          title="Space-filling curves"
        >
          {curveWalks.map(({ dither, ...entry }) => (
            <Row key={entry.name} {...entry}>
              <RampPlate dither={dither} />
            </Row>
          ))}
        </Shelf>

        <Shelf
          count={formEntries.length}
          note="Everything above holds the picture flat and varies the algorithm. These do the opposite: one screen — Bayer 4×4, the matrix Bayer Wash was cut from — asked to print ten different things. A dither is not only a texture you apply to an image; given a field with a shape in it, the dots are the only thing drawing, and the form comes out of nothing but where they fall."
          title="Forms"
          unit="form"
        >
          {formEntries.map(({ field, ...entry }) => (
            <Row key={entry.name} {...entry}>
              <FormPlate field={field} />
            </Row>
          ))}
        </Shelf>

        <section className="mt-20 border-t border-rule pt-10">
          <p className="text-caption text-quiet tabular-nums">
            {washVariants.length} variants
          </p>
          <h2 className="mt-2 text-title text-balance">Wash variants</h2>
          <p className="mt-4 max-w-[62ch] text-body text-quiet text-pretty">
            The forms above compute a field and threshold it. Bayer Wash never did that, and
            that is what made it worth keeping: each of the sixteen dot positions gets its own
            mask, a radial gradient with a single hard stop, so a dot is printed out to its own
            radius and not one pixel further. Sixteen radii, sixteen hard-edged shells, and the
            glow is what sixteen hard edges look like from a distance. Nothing in the output is
            soft.
          </p>
          <p className="mt-4 max-w-[62ch] text-body text-quiet text-pretty">
            Which leaves three things to turn. Move the origin. Repeat the shell &mdash; and the
            wash becomes a tunnel, the rings being the same sixteen radii printed over and over
            instead of once. Or clip the result to a disc, and the falloff becomes a lit sphere
            with no surface solved and no light computed. Same sixteen dots, same masks, same
            commit.
          </p>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {washVariants.map(({ ball, id, name, note, origin, repeat }) => (
              <li key={id}>
                <div className="landing-panel aspect-square overflow-hidden">
                  <BayerWash
                    ball={ball}
                    className="size-full text-ink"
                    id={id}
                    origin={origin}
                    repeat={repeat}
                  />
                </div>
                <h3 className="mt-3 text-headline">{name}</h3>
                <p className="mt-1 text-caption text-quiet text-pretty">{note}</p>
              </li>
            ))}
          </ul>
        </section>

        <Shelf
          count={applications.length}
          note="Everything above this line asks what a dither is. This asks where it goes — and it is the part that separates using dither as a hero background from having it as a material. The rule the working design systems land on is that the texture belongs in the states nobody photographs: the empty panel, the skeleton, the mask that fades a paragraph out. Two of these the archive at the top was already doing without a name for it."
          title="Applications"
          unit="application"
        >
          {applications.map(({ demo, ...entry }) => (
            <Row key={entry.name} {...entry}>
              {demo}
            </Row>
          ))}
        </Shelf>

        <Shelf
          count={paletteEntries.length}
          note="Every plate above answers a one-bit question: dot, or no dot. Give the device more inks and the question changes — the quantiser picks the two inks the wanted tone falls between, and the dither only decides which of those two lands in each cell. Two inks is the smallest case of this, not a different technique. Each ink you add takes territory away from the dither, until it survives only in the seams."
          title="Palette"
          unit="palette"
        >
          {paletteEntries.map(({ cols, inks, ...entry }) => (
            <Row key={entry.name} {...entry}>
              <PalettePlate cols={cols} inks={inks} rows={Math.round(cols * 0.56)} />
            </Row>
          ))}
        </Shelf>

        <p className="mt-14 max-w-[62ch] text-note text-quiet text-pretty">
          The Fumadocs plate is not a pastiche. The four colours were counted out of{' '}
          <code className="text-caption">bg-2.png</code> on fumadocs.dev &mdash; the
          image holds exactly four &mdash; and the threshold order was recovered from its pixels
          by measuring how often each of the sixteen positions in the tile takes the lighter
          ink. It comes back as Bayer 4×4 to the number, phase-shifted by one row: the same
          sixteen values already sitting in this project&rsquo;s{' '}
          <code className="text-caption">bayer.tsx</code>.
        </p>

        <Shelf
          count={compositeEntries.length}
          note="Averaging that same PNG over its own 16px tile makes the dither integrate away and gives the picture back. What comes out is a photograph — a street lamp against cloud, with a tree line along the bottom — not, as it reads at a glance, a dithered sphere over noise. It is a fair misreading, and worth building anyway, because a glow layered over cloud and cut by a horizon is precisely how you would get that image without owning the photograph. Every form earlier on this page is one field. These are three at once, which is where a demonstration turns into a picture."
          title="Composite"
          unit="layer"
        >
          {compositeEntries.map(({ cols, field, inks, ...entry }) => (
            <Row key={entry.name} {...entry}>
              <PalettePlate cols={cols} field={field} inks={inks} rows={Math.round(cols * 0.56)} />
            </Row>
          ))}
        </Shelf>

        <section className="mt-20 border-t border-rule pt-10">
          <p className="text-caption text-quiet tabular-nums">
            {faviconEntries.length} proposals
          </p>
          <h2 className="mt-2 text-title text-balance">Favicons</h2>
          <p className="mt-4 max-w-[62ch] text-body text-quiet text-pretty">
            This project shipped without one until the last plate on this page, which is the
            only reason the section exists. Every plate above is drawn wide enough that the
            screen is a texture laid over a picture. A favicon is sixteen CSS pixels across
            &mdash; four Bayer tiles, corner to corner &mdash; and at that size the screen stops
            being a texture on the picture and starts being the picture. Most of what this page
            has spent itself proving does not survive the reduction, and the plates below run
            from the ones that do not survive it to the ones drawn for it.
          </p>
          <p className="mt-4 max-w-[62ch] text-body text-quiet text-pretty">
            Each proposal appears three times: magnified, so the grid is visible at all, then at
            32 and at 16 pixels, which is where the argument is actually settled. A favicon
            judged at 200 pixels has not been judged. The tone flips with the page, so a shipped
            icon has one more test to pass that nothing here does &mdash; it has to hold in
            browser chrome it does not control.
          </p>

          <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2">
            {faviconEntries.map(({ ink, name, note, spec }) => (
              <li key={name}>
                <div className="landing-panel overflow-hidden p-4">
                  <FaviconPlate ink={ink} />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="size-8">
                    <FaviconPlate ink={ink} />
                  </div>
                  <div className="size-4">
                    <FaviconPlate ink={ink} />
                  </div>
                  <span className="text-caption text-quiet tabular-nums">
                    32 and 16 px, actual size
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="text-headline">{name}</h3>
                  <span className="text-caption text-quiet">{spec}</span>
                </div>
                <p className="mt-2 text-note text-quiet text-pretty">{note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

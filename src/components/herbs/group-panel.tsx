import type { GroupPanel as GroupPanelData } from "@/content/types"

/**
 * The side panels of a group poster.
 *
 * The posters put three different things in these panels, and a single grid of
 * equal cards suits none of them, so each shape gets the layout it needs:
 *
 *   • a pipe-delimited table ("เมนู | สมุนไพรเด่น | ประโยชน์") → a real table
 *   • numbered recipes → one card per recipe, so two never share a box
 *   • a plain pairing list ("อัญชัน ชาสมุนไพรบำรุงสมอง") → columns
 */
export function GroupPanel({ panel }: { panel: GroupPanelData }) {
  /* Some poster panels carry the section name and the recipe number into one
     string ("ตำรับ…สตรีหลังคลอด: 1. น้ำสมุนไพร…", "2. ลูกประคบ…"). The recipe's
     own name is the useful part, and the section already has a heading above. */
  const title = panel.title
    .replace(/^.*?:\s*(?=\d+[.)]\s)/, "")
    .replace(/^\d+[.)]\s*/, "")

  const rows = panel.items.filter((item) => item.includes("|"))
  const isTable = rows.length >= 2 && rows.length === panel.items.length
  const recipes = isTable ? [] : parseRecipes(panel.items)

  // One recipe, one card.
  if (recipes.length) {
    return (
      <section>
        <h3 className="type-h4 text-marker">{title}</h3>
        <ul className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe, i) => (
            <li key={i} className="sheet flex flex-col p-6">
              <h4 className="type-h4">{recipe.heading || title}</h4>
              <div className="mt-4 space-y-5">
                {recipe.groups.map((group, gi) => (
                  <div key={gi}>
                    {group.label && <p className="label text-muted-foreground">{group.label}</p>}
                    <Lines
                      lines={group.lines}
                      ordered={/^(วิธีทำ|วิธีใช้)/.test(group.label ?? "")}
                    />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
        {panel.note && <p className="type-sm mt-5 text-muted-foreground">{panel.note}</p>}
      </section>
    )
  }

  return (
    <section className="sheet p-6 sm:p-8">
      <h3 className="type-h4 text-marker">{title}</h3>
      <div className="mt-6">
        {isTable ? (
          <PanelTable rows={panel.items} />
        ) : (
          <ul className="grid gap-x-10 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {panel.items.map((item, i) => (
              <li key={i} className="flex gap-3 type-sm">
                <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 bg-moss" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {panel.note && (
        <p className="type-sm mt-6 border-t border-border pt-5 text-muted-foreground">
          {panel.note}
        </p>
      )}
    </section>
  )
}

function PanelTable({ rows }: { rows: string[] }) {
  const cells = rows.map((row) => row.split("|").map((cell) => cell.trim()))
  const [head, ...body] = cells

  return (
    <div className="scroll-paper overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {head.map((cell, i) => (
              <th key={i} scope="col" className="label pr-6 pb-3 text-muted-foreground">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b border-border/60 align-top">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`py-3.5 pr-6 type-sm ${ci === 0 ? "font-semibold whitespace-nowrap" : "text-muted-foreground"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type Recipe = { heading: string; groups: { label: string | null; lines: string[] }[] }

const INGREDIENT_LABEL = /^(ส่วนผสม|ส่วนประกอบ)/
const LABEL = /^(ส่วนผสม|ส่วนประกอบ|วิธีทำ|วิธีใช้|ประโยชน์|สรรพคุณ|ข้อควรระวัง)/
const NUMBERED = /^\d+[.)]?\s/

/**
 * A recipe panel is a flat list, and both the recipe titles and the steps
 * inside วิธีทำ are numbered — one poster writes steps as "1 ล้าง…", another as
 * "1. ล้าง…". Numbering alone therefore cannot tell a title from a step.
 *
 * What does distinguish them: a recipe title is always followed by its
 * ingredient list, so an item only opens a recipe when the next line is a
 * ส่วนผสม heading. Everything else numbered stays a step.
 */
function parseRecipes(items: string[]): Recipe[] {
  const recipes: Recipe[] = []

  items.forEach((item, i) => {
    if (NUMBERED.test(item) && INGREDIENT_LABEL.test(items[i + 1] ?? "")) {
      recipes.push({ heading: item.replace(NUMBERED, ""), groups: [] })
      return
    }

    if (!recipes.length) {
      // A single unnumbered recipe: the panel title is its name. Anything
      // before the first section label is not part of a recipe.
      if (!LABEL.test(item)) return
      recipes.push({ heading: "", groups: [] })
    }

    const recipe = recipes.at(-1)!
    if (LABEL.test(item)) {
      recipe.groups.push({ label: item, lines: [] })
    } else {
      const group = recipe.groups.at(-1)
      if (group) group.lines.push(item)
      else recipe.groups.push({ label: null, lines: [item] })
    }
  })

  return recipes.filter((recipe) => recipe.groups.length)
}

/** Steps keep their order; ingredients are a plain list. */
function Lines({ lines, ordered }: { lines: string[]; ordered: boolean }) {
  const clean = lines.map((line) => line.replace(NUMBERED, ""))

  if (ordered) {
    return (
      <ol className="mt-2 space-y-2">
        {clean.map((line, i) => (
          <li key={i} className="flex gap-3 type-sm">
            <span aria-hidden="true" className="w-5 shrink-0 font-semibold text-marker tabular-nums">
              {i + 1}.
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <ul className="mt-2 space-y-2">
      {clean.map((line, i) => (
        <li key={i} className="flex gap-3 type-sm">
          <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 bg-moss" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  )
}

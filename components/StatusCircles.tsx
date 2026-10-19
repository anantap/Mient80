import { STATUS_ORDER, type Lijn, type Status } from "@/lib/types";

const ARC_LABEL: Record<Status, (n: number) => string> = {
  loopt: (n) => (n === 1 ? "lijn loopt" : "lijnen lopen"),
  wacht: () => "wacht op ander",
  geblokkeerd: () => "geblokkeerd",
  klaar: () => "klaar",
};

export function StatusCircles({ lijnen }: { lijnen: Lijn[] }) {
  return (
    <div className="circles">
      {STATUS_ORDER.map((status) => {
        const inStatus = lijnen.filter((l) => l.status === status);
        const kritiek = inStatus.filter((l) => l.kritiek).length;
        const n = inStatus.length;
        const id = `arc-${status}`;
        return (
          <figure key={status} className={`circle circle-${status}`}>
            <svg viewBox="0 0 200 200" role="img" aria-label={`${n} ${ARC_LABEL[status](n)}`}>
              <defs>
                <path id={`${id}-b`} d="M 24 100 A 76 76 0 0 0 176 100" />
                <path id={`${id}-t`} d="M 30 100 A 70 70 0 0 1 170 100" />
              </defs>
              <circle cx="100" cy="100" r="100" className="circle-fill" />
              <text x="100" y="104" textAnchor="middle" dominantBaseline="central" className="circle-num">
                {n}
              </text>
              <text className="circle-arc">
                <textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle">
                  {ARC_LABEL[status](n)}
                </textPath>
              </text>
              {kritiek > 0 && (
                <text className="circle-arc circle-arc-top">
                  <textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">
                    {`${kritiek} op kritiek pad`}
                  </textPath>
                </text>
              )}
            </svg>
          </figure>
        );
      })}
    </div>
  );
}

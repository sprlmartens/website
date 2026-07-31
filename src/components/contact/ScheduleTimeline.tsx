type Segment = { start: string; end: string; onRequest?: boolean }

const schedule: { day: string; segments: Segment[] }[] = [
  {
    day: "Lundi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "18:00" },
    ],
  },
  {
    day: "Mardi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "18:00", onRequest: true },
    ],
  },
  {
    day: "Mercredi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "18:00" },
    ],
  },
  {
    day: "Jeudi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "18:00" },
    ],
  },
  {
    day: "Vendredi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "16:30" },
    ],
  },
]

const DAY_START = 9 * 60
const DAY_END = 18 * 60
const DAY_SPAN = DAY_END - DAY_START

const AXIS_TICKS: {
  time: string
  label: string
  align: "start" | "center" | "end"
}[] = [
  { time: "9:00", label: "9h", align: "start" },
  { time: "12:30", label: "12h30", align: "end" },
  { time: "13:00", label: "13h", align: "start" },
  { time: "16:30", label: "16h30", align: "center" },
  { time: "18:00", label: "18h", align: "end" },
]

const AXIS_ALIGN: Record<string, string> = {
  start: "translate-x-0",
  center: "-translate-x-1/2",
  end: "-translate-x-full",
}

function toPercent(time: string) {
  const [h, m] = time.split(":").map(Number)
  return ((h * 60 + m - DAY_START) / DAY_SPAN) * 100
}

export default function ScheduleTimeline() {
  return (
    <>
      <div className="space-y-2.5">
        {schedule.map((row) => (
          <div
            key={row.day}
            className="grid grid-cols-[4.5rem_1fr] items-center gap-3"
          >
            <span className="text-sm text-foreground/70">{row.day}</span>
            <div className="relative h-2 rounded-full bg-foreground/10">
              {row.segments.map((seg) => (
                <span
                  key={seg.start}
                  className={
                    "absolute inset-y-0 rounded-full " +
                    (seg.onRequest ? "bg-accent" : "bg-primary")
                  }
                  style={{
                    left: `${toPercent(seg.start)}%`,
                    width: `${toPercent(seg.end) - toPercent(seg.start)}%`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-[4.5rem_1fr] gap-3">
        <span />
        <div className="relative h-3.5 text-sm font-medium text-foreground/70">
          {AXIS_TICKS.map((tick) => (
            <span
              key={tick.time}
              className={`absolute whitespace-nowrap ${AXIS_ALIGN[tick.align]}`}
              style={{ left: `${toPercent(tick.time)}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-5 text-sm text-foreground/70">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Ouvert
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Sur rendez-vous
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground/70">
        En dehors de ces horaires, notre service d&apos;assistance
        téléphonique reste joignable et prend en charge vos appels pour un
        suivi rapide.
      </p>
    </>
  )
}

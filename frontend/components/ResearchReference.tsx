"use client";

import Image from "next/image";
import { NOTIFICATION_PRIORITIES } from "@aura/core/config/aura";
import { CREW_PROFILES, REFERENCE_LABS } from "@aura/core/lib/research-data";
import { runValidationCases } from "@aura/core/lib/validation-cases";

export default function ResearchReference() {
  return <div className="research-reference">
    <section>
      <h3>Team-provided demo crew</h3>
      <p>Exact values from sample.csv (5 rows, 10 columns), matching Nasa Space Apps 26.pdf, page 1. These are demonstration profiles, not live astronaut records. No observation timestamps or exposure durations were supplied.</p>
      <p>CSV snapshots stay unchanged until a demo scenario starts. Heart rate, CO₂ and acute absorbed dose were not supplied and are shown as missing. Scenarios generate simulated readings; reset restores the supplied row. Alert bands follow the team research and are not a clinically validated diagnostic system.</p>
      <div className="research-table-scroll"><table>
        <thead><tr>{["Crew", "Daily dose mSv/day", "Cumulative mSv", "CO ppm", "Cabin °C", "Core °C", "MHI", "PVT+ ms", "Lapses / 300 s", "HRV ms"].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead>
        <tbody>{CREW_PROFILES.map((crew) => <tr key={crew.id}><th>{crew.id}</th>{[crew.readings.doseRate, crew.readings.cumulativeDose, crew.readings.co, crew.readings.cabinTemp, crew.readings.coreTemp, crew.mhiScore, crew.readings.pvtReactionMs, crew.readings.pvtLapses, crew.readings.hrv].map((value, index) => <td key={index}>{value}</td>)}</tr>)}</tbody>
      </table></div>
    </section>
    <section>
      <h3>Known-input rule checks</h3>
      <p>Simulated test inputs with independently specified expected outcomes. These run the same backend evaluator used by the viewer. They verify implementation behavior, not clinical validity. Numeric bands are aligned to Nasa Space Apps 26 (2).pdf; the confirmed core-temperature gaps remain caution.</p>
      <div className="research-table-scroll"><table><thead><tr><th>Case</th><th>Input</th><th>Expected</th><th>Actual</th><th>Check</th></tr></thead><tbody>{runValidationCases().map((example) => <tr key={`${example.metric}-${example.value}`}><th>{example.label}</th><td>{example.value} {example.unit}</td><td>{example.expected}</td><td>{example.actual}</td><td>{example.passed ? "Pass" : "Fail"}</td></tr>)}</tbody></table></div>
      <p>600 mSv is a NASA career effective-dose reference. Its red review tier and the 150 mSv warning are project display policies, not validated acute-emergency thresholds. Gy/mGy measure absorbed dose; they are not generally interchangeable with mSv.</p>
    </section>
    <section>
      <h3>Notification priority</h3>
      <p>Critical alerts appear first. Within each severity, alerts follow the team hierarchy from Nasa Space Apps 26 (4).pdf. This is a project notification policy.</p>
      <div className="research-table-scroll"><table><thead><tr><th>Rank</th><th>Hazard domain</th></tr></thead><tbody>{NOTIFICATION_PRIORITIES.map((priority) => <tr key={priority.rank}><td>{priority.rank}</td><th>{priority.label}</th></tr>)}</tbody></table></div>
      <p>Recorded SEP events create a precaution. Crew exposure assessment requires dosimetry, timing, location and shielding information.</p>
    </section>
    <section>
      <h3>Research-reported metabolic reference values</h3>
      <p>Nasa Space Apps 26 (1).pdf, pages 11–13, cites <a href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-575" target="_blank" rel="noreferrer">NASA OSDR OSD-575 / LSDS-8</a>. These values have not been independently reproduced from the raw study files. Subject labels C003/C004 are not linked to the AST demo profiles.</p>
      <div className="research-table-scroll"><table>
        <thead><tr><th>Analyte</th><th>Supplied reference interval</th><th>Reported R+1 value</th><th>Subject</th></tr></thead>
        <tbody>{REFERENCE_LABS.map((lab) => <tr key={lab.analyte}><th>{lab.analyte}</th><td>{lab.range}</td><td>{lab.observed}</td><td>{lab.subject}</td></tr>)}</tbody>
      </table></div>
      <p>Reference context only; these observations do not drive a live diagnosis or imply that this app receives laboratory results.</p>
      <Image src="/research/metabolic-panel-reference.png" width={1600} height={1091} alt="Metabolic panel figure supplied in the team's research PDF" />
    </section>
    <section>
      <h3>RR-1 radiation reference figure</h3>
      <p>Figure supplied on page 10 of Nasa Space Apps 26 (1).pdf, plotted in mGy. This is a static research reference; the underlying time series was not supplied and is not replayed or converted to effective dose. The app continues to use its bundled NASA DONKI data for space-weather events.</p>
      <Image src="/research/rr1-radiation-reference.png" width={1600} height={900} alt="RR-1 accumulated radiation reference chart supplied in the research PDF" />
    </section>
  </div>;
}

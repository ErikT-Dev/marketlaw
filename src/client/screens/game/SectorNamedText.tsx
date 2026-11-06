import type { Sector } from "../../../shared/catalogue/Sector";
import { sectorColor } from "../../components/sectorColor";

type Props = {
  readonly text: string;
  readonly sector: Sector | null;
};

export function SectorNamedText({ text, sector }: Props) {
  const start = sector === null ? -1 : text.indexOf(sector);
  if (sector === null || start === -1) {
    return <>{text}</>;
  }
  const end = start + sector.length;
  return (
    <>
      {text.slice(0, start)}
      <span style={{ color: sectorColor(sector, "light") }}>{sector}</span>
      {text.slice(end)}
    </>
  );
}

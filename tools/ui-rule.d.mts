export interface Offender {
  line: number;
  tag: "button" | "select" | "input" | "textarea";
}
export interface Drift {
  file: string;
  count: number;
  baseline: number;
}
export declare const RAW_TAGS: ReadonlySet<string>;
export declare const EXEMPT_INPUT_TYPES: ReadonlySet<string>;
export declare function findOffenders(source: string, fileName: string): Offender[];
export declare function compare(
  counts: Record<string, number>,
  baseline: Record<string, number>,
): { added: Drift[]; removed: Drift[] };

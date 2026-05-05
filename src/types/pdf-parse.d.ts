declare module "pdf-parse" {
  type PdfData = { text: string; numpages: number };
  function pdf(dataBuffer: Buffer): Promise<PdfData>;
  export default pdf;
}

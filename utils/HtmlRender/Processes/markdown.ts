import { marked } from "marked";

export default (text: string) => marked.parse(text);

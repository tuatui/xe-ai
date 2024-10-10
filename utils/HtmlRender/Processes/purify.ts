import DOMPurify from "dompurify";
export default (i: string) => DOMPurify.sanitize(i);

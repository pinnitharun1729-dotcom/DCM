import { jsPDF } from "jspdf";
const doc = new jsPDF();
console.log(typeof doc.GState);
console.log(typeof doc.setGState);

import { CreateAnswerRequest } from "@/types/answer";
import * as XLSX from "xlsx";

export interface ExcelQuestionRow {
  question: string;
  hint: string;
  solution: string;
  checkCommand: string;
  typeQuestion: string;
  answers: CreateAnswerRequest[];
}

class ExcelService {
  parseExcelFile(file: File): Promise<ExcelQuestionRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const questions = this.transformExcelData(jsonData);
          resolve(questions);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  }

  private transformExcelData(data: any[]): ExcelQuestionRow[] {
    const questions: ExcelQuestionRow[] = [];

    data.forEach((row: any) => {
      const answers: CreateAnswerRequest[] = [];

      // Giả sử file Excel có cấu trúc:
      // Question | Hint | Solution | Answer1 | IsCorrect1 | Answer2 | IsCorrect2 | Answer3 | IsCorrect3 | Answer4 | IsCorrect4

      for (let i = 1; i <= 4; i++) {
        const answerKey = `Answer${i}`;
        const isCorrectKey = `IsCorrect${i}`;

        if (row[answerKey]) {
          answers.push({
            content: String(row[answerKey]).trim(),
            isRightAns: this.parseBoolean(row[isCorrectKey]),
          });
        }
      }

      if (row.Question && answers.length > 0) {
        questions.push({
          question: String(row.Question).trim(),
          hint: String(row.Hint || "").trim(),
          solution: String(row.Solution || "").trim(),
          answers,
          checkCommand: String(row.CheckCommand || "").trim(),
          typeQuestion: String(row.TypeQuestion || "").trim(),
        });
      }
    });

    return questions;
  }

  private parseBoolean(value: any): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim();
      return (
        normalized === "true" || normalized === "1" || normalized === "yes"
      );
    }
    if (typeof value === "number") return value === 1;
    return false;
  }

  downloadTemplate(): void {
    const template = [
      {
        Question: "What is 2 + 2?",
        Hint: "Basic addition",
        Solution: "Add the two numbers together",
        CheckCommand: "Docker check ",
        TypeQuestion: "multiple-choice",
        Answer1: "3",
        IsCorrect1: "false",
        Answer2: "4",
        IsCorrect2: "true",
        Answer3: "5",
        IsCorrect3: "false",
        Answer4: "6",
        IsCorrect4: "false",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "questions_template.xlsx");
  }
}

export const excelService = new ExcelService();

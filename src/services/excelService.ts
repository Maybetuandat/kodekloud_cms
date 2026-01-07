import { CreateAnswerRequest } from "@/types/answer";
import * as XLSX from "xlsx";

export interface ExcelQuestionRow {
  question: string;
  hint: string;
  solution: string;
  checkCommand: string;
  typeQuestion: number;
  answers: CreateAnswerRequest[];
}

export interface ValidationError {
  row: number;
  question: string;
  errors: string[];
}

export interface ParseResult {
  questions: ExcelQuestionRow[];
  validationErrors: ValidationError[];
  hasErrors: boolean;
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

  parseExcelFileWithValidation(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const result = this.transformExcelDataWithValidation(jsonData);
          resolve(result);
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
      const typeQuestion = Number(row.TypeQuestion || 0);

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

      // typeQuestion = 1: Kiểm tra hạ tầng - không cần answers
      // typeQuestion = 0 hoặc khác: Câu hỏi thường - cần answers
      const isInfrastructureCheck = typeQuestion === 1;

      if (row.Question) {
        // Nếu là câu hỏi kiểm tra hạ tầng, cho phép không có answers
        // Nếu là câu hỏi thường, cần ít nhất 1 answer
        if (isInfrastructureCheck || answers.length > 0) {
          questions.push({
            question: String(row.Question).trim(),
            hint: String(row.Hint || "").trim(),
            solution: String(row.Solution || "").trim(),
            answers: isInfrastructureCheck ? [] : answers,
            checkCommand: String(row.CheckCommand || "").trim(),
            typeQuestion: typeQuestion,
          });
        }
      }
    });

    return questions;
  }

  private transformExcelDataWithValidation(data: any[]): ParseResult {
    const questions: ExcelQuestionRow[] = [];
    const validationErrors: ValidationError[] = [];

    data.forEach((row: any, index: number) => {
      const rowNumber = index + 2; // +2 vì row 1 là header
      const errors: string[] = [];
      const answers: CreateAnswerRequest[] = [];
      const typeQuestion = Number(row.TypeQuestion || 0);

      // Kiểm tra câu hỏi có tồn tại không
      if (!row.Question || String(row.Question).trim() === "") {
        errors.push("Thiếu nội dung câu hỏi");
      }

      // Parse answers
      for (let i = 1; i <= 4; i++) {
        const answerKey = `Answer${i}`;
        const isCorrectKey = `IsCorrect${i}`;

        if (row[answerKey] && String(row[answerKey]).trim() !== "") {
          answers.push({
            content: String(row[answerKey]).trim(),
            isRightAns: this.parseBoolean(row[isCorrectKey]),
          });
        }
      }

      const isInfrastructureCheck = typeQuestion === 1;
      const questionText = String(row.Question || "").trim();

      // Validation theo loại câu hỏi
      if (isInfrastructureCheck) {
        // typeQuestion = 1: Kiểm tra hạ tầng
        // Cần có checkCommand
        if (!row.CheckCommand || String(row.CheckCommand).trim() === "") {
          errors.push(
            "Câu hỏi kiểm tra hạ tầng (typeQuestion=1) cần có lệnh kiểm tra (CheckCommand)"
          );
        }
        // Không cần answers - nhưng nếu có thì bỏ qua (không báo lỗi)
      } else {
        // typeQuestion = 0 hoặc khác: Câu hỏi thường
        // Cần có ít nhất 1 answer
        if (answers.length === 0) {
          errors.push(
            "Câu hỏi thường (typeQuestion=0) cần có ít nhất 1 câu trả lời"
          );
        } else {
          // Kiểm tra có ít nhất 1 đáp án đúng
          const hasCorrectAnswer = answers.some((a) => a.isRightAns);
          if (!hasCorrectAnswer) {
            errors.push("Cần có ít nhất 1 đáp án đúng");
          }
        }
      }

      if (errors.length > 0) {
        validationErrors.push({
          row: rowNumber,
          question: questionText || `Dòng ${rowNumber}`,
          errors,
        });
      } else if (questionText) {
        questions.push({
          question: questionText,
          hint: String(row.Hint || "").trim(),
          solution: String(row.Solution || "").trim(),
          answers: isInfrastructureCheck ? [] : answers,
          checkCommand: String(row.CheckCommand || "").trim(),
          typeQuestion: typeQuestion,
        });
      }
    });

    return {
      questions,
      validationErrors,
      hasErrors: validationErrors.length > 0,
    };
  }

  validateQuestions(questions: ExcelQuestionRow[]): ValidationError[] {
    const errors: ValidationError[] = [];

    questions.forEach((q, index) => {
      const rowErrors: string[] = [];
      const isInfrastructureCheck = q.typeQuestion === 1;

      if (!q.question || q.question.trim() === "") {
        rowErrors.push("Thiếu nội dung câu hỏi");
      }

      if (isInfrastructureCheck) {
        if (!q.checkCommand || q.checkCommand.trim() === "") {
          rowErrors.push(
            "Câu hỏi kiểm tra hạ tầng cần có lệnh kiểm tra (CheckCommand)"
          );
        }
      } else {
        if (q.answers.length === 0) {
          rowErrors.push("Câu hỏi thường cần có ít nhất 1 câu trả lời");
        } else {
          const hasCorrectAnswer = q.answers.some((a) => a.isRightAns);
          if (!hasCorrectAnswer) {
            rowErrors.push("Cần có ít nhất 1 đáp án đúng");
          }
        }
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: index + 1,
          question: q.question || `Câu hỏi ${index + 1}`,
          errors: rowErrors,
        });
      }
    });

    return errors;
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
        Question: "Câu hỏi kiểm tra hạ tầng - Docker đã được cài đặt chưa?",
        Hint: "Kiểm tra Docker installation",
        Solution: "Chạy lệnh docker --version",
        CheckCommand: "docker --version",
        TypeQuestion: "1",
        Answer1: "",
        IsCorrect1: "",
        Answer2: "",
        IsCorrect2: "",
        Answer3: "",
        IsCorrect3: "",
        Answer4: "",
        IsCorrect4: "",
      },
      {
        Question: "2 + 2 bằng bao nhiêu?",
        Hint: "Phép cộng cơ bản",
        Solution: "Cộng hai số lại với nhau",
        CheckCommand: "",
        TypeQuestion: "0",
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

    // Set column widths
    ws["!cols"] = [
      { wch: 50 }, // Question
      { wch: 30 }, // Hint
      { wch: 30 }, // Solution
      { wch: 30 }, // CheckCommand
      { wch: 15 }, // TypeQuestion
      { wch: 20 }, // Answer1
      { wch: 12 }, // IsCorrect1
      { wch: 20 }, // Answer2
      { wch: 12 }, // IsCorrect2
      { wch: 20 }, // Answer3
      { wch: 12 }, // IsCorrect3
      { wch: 20 }, // Answer4
      { wch: 12 }, // IsCorrect4
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "questions_template.xlsx");
  }
}

export const excelService = new ExcelService();

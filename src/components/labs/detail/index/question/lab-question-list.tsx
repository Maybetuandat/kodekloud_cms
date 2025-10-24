import { LabQuestionsEmptyState } from "./lab-question-empty-state";
import { LabQuestionItem } from "./lab-question-item";

interface Question {
  id: number;
  // Add other question properties here
}

interface LabQuestionsListProps {
  questions: Question[];
  currentPage: number;
  pageSize: number;
  onCreateQuestion: () => void;
  onEditQuestion: (questionId: number) => void;
  onDeleteQuestion: (questionId: number) => void;
}

export function LabQuestionsList({
  questions,
  currentPage,
  pageSize,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: LabQuestionsListProps) {
  if (questions.length === 0) {
    return <LabQuestionsEmptyState onCreateQuestion={onCreateQuestion} />;
  }

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <LabQuestionItem
          key={question.id}
          question={question}
          index={currentPage * pageSize + index + 1}
          onEdit={onEditQuestion}
          onDelete={onDeleteQuestion}
        />
      ))}
    </div>
  );
}

import { User } from "@/types/user";

interface CourseUserTabProps {
  isLoading: boolean;
  usersInCourse: User[];
}
export default function CourseUserTab({ isLoading }: CourseUserTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <div>User Tab Content</div>;
}

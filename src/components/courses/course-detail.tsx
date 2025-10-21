import { ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryMap } from "@/constants/category-map";
import { useParams } from "react-router-dom";
import { useCourseDetailPage } from "@/app/courses/detail-page/use-course-detail";
import { Course } from "@/types/course";
import { LabList } from "../labs/lists/lab-list";
import { useState } from "react";
import { CreateLabModal } from "../labs/modal/create-lab-modal";
import { Lab } from "@/types/lab";

// import { CreateLabModal } from "@/components/labs/create-lab-modal";
// import { LabList } from "@/components/labs/lab-list";

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();

  const [isCreateLabOpen, setIsCreateLabOpen] = useState(false);

  const { course, labs } = useCourseDetailPage(Number(id));

  const safeCourse: Course = course || {
    id: 0,
    title: "",
    description: "",
    level: "",
    durationMinutes: 0,
    updatedAt: "",
    shortDescription: "",
    isActive: false,
    labs: [],
    category: {
      id: 0,
      title: "",
      description: "",
      slug: "",
      createdAt: "",
      updatedAt: "",
    },
    listCourseUser: [],
  };

  const handleDeleteLab = (labId: string) => {
    //TODO
    console.log("Delete lab with ID:", labId);
  };

  const handleCreateLab = (newLab: Lab) => {
    //TODO
    console.log("Create new lab:", newLab);
    setIsCreateLabOpen(false);
  };

  const onBack = () => window.history.back();

  // Simulate API fetch

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${
          categoryMap["docker"]?.gradient || "from-gray-400 to-gray-500"
        } text-white p-6`}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>

        <h1 className="text-4xl font-bold mb-2">{safeCourse.title}</h1>
        <p className="text-white/90 mb-4">{safeCourse.shortDescription}</p>

        <div className="flex gap-3 flex-wrap">
          <Badge variant="secondary">{safeCourse.level}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="labs">Bài thực hành</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Mô tả chi tiết</h2>
              <div
                className="prose max-w-none dark:prose-invert text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: safeCourse.description as string,
                }}
              />
            </Card>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Bài thực hành</h2>
              <Button
                onClick={() => setIsCreateLabOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Tạo bài thực hành
              </Button>
            </div>

            {labs && labs.length > 0 ? (
              <LabList labs={labs} onDeleteLab={handleDeleteLab} />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Chưa có bài thực hành nào
                </p>
                <Button
                  onClick={() => setIsCreateLabOpen(true)}
                  variant="outline"
                >
                  Tạo bài thực hành đầu tiên
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateLabModal
        isOpen={isCreateLabOpen}
        onClose={() => setIsCreateLabOpen(false)}
        onSubmit={handleCreateLab}
      />
    </div>
  );
}

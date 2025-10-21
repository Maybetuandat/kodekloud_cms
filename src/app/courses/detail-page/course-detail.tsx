import { ArrowLeft, Plus, Edit, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryMap } from "@/constants/category-map";
import { useParams } from "react-router-dom";
import { useCourseDetailPage } from "@/app/courses/detail-page/use-course-detail";
import { Course } from "@/types/course";
import { LabList } from "../../../components/labs/lists/lab-list";
import { useState } from "react";
import { CreateLabModal } from "../../../components/labs/modal/create-lab-modal";
import { Lab } from "@/types/lab";
import { useTranslation } from "react-i18next";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  BasicInfoFormData,
  EditBasicInfoModal,
} from "@/components/courses/edit-basic-info-modal";

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(["courses", "common"]);

  const [isCreateLabOpen, setIsCreateLabOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditBasicInfoOpen, setIsEditBasicInfoOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  const { course, labs, updateDescriptionCourse, updateBasicInfoCourse } =
    useCourseDetailPage(Number(id));

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

  const handleEditDescription = () => {
    setEditedDescription(safeCourse.description || "");
    setIsEditingDescription(true);
  };

  const handleSaveDescription = () => {
    updateDescriptionCourse(editedDescription);
    setIsEditingDescription(false);
  };

  const handleCancelEdit = () => {
    setIsEditingDescription(false);
    setEditedDescription("");
  };

  const handleSaveBasicInfo = (data: BasicInfoFormData) => {
    //TODO: Call API to update basic info
    updateBasicInfoCourse(data);
    console.log("💾 Saving basic info:", data);
  };

  const onBack = () => window.history.back();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${
          categoryMap["docker"]?.gradient || "from-gray-400 to-gray-500"
        } text-white p-6 relative`}
      >
        {/* Edit Button - Top Right */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsEditBasicInfoOpen(true)}
          className="absolute top-4 right-4 gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          <Edit className="h-4 w-4" />
          {t("common.edit")}
        </Button>

        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t("courses.detail.backButton")}</span>
        </button>

        <h1 className="text-4xl font-bold mb-2">{safeCourse.title}</h1>
        <p className="text-white/90 mb-4">{safeCourse.shortDescription}</p>

        <div className="flex gap-3 flex-wrap">
          <Badge variant="secondary">{safeCourse.level}</Badge>
          {safeCourse.durationMinutes && (
            <Badge variant="secondary">
              {Math.floor(safeCourse.durationMinutes / 60)}h{" "}
              {safeCourse.durationMinutes % 60}m
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">
              {t("courses.detail.tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="labs">
              {t("courses.detail.tabs.labs")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {t("courses.detail.overview.detailTitle")}
                </h2>

                {!isEditingDescription ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditDescription}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {t("common.edit")}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      {t("common.cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveDescription}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {t("common.save")}
                    </Button>
                  </div>
                )}
              </div>

              {!isEditingDescription ? (
                <div
                  className="prose max-w-none dark:prose-invert text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: safeCourse.description as string,
                  }}
                />
              ) : (
                <div
                  className="min-h-[300px] overflow-y-auto"
                  data-color-mode="light"
                >
                  <ReactQuill
                    theme="snow"
                    value={editedDescription}
                    onChange={(html) => {
                      setEditedDescription(html);
                      console.log("🌐 HTML content:", html);
                    }}
                    className="h-[400px]"
                  />
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {t("courses.detail.labs.title")}
              </h2>
              <Button
                onClick={() => setIsCreateLabOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("courses.detail.labs.createButton")}
              </Button>
            </div>

            {labs && labs.length > 0 ? (
              <LabList labs={labs} onDeleteLab={handleDeleteLab} />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {t("courses.detail.labs.noLabs")}
                </p>
                <Button
                  onClick={() => setIsCreateLabOpen(true)}
                  variant="outline"
                >
                  {t("courses.detail.labs.createFirstLab")}
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Lab Modal */}
      <CreateLabModal
        isOpen={isCreateLabOpen}
        onClose={() => setIsCreateLabOpen(false)}
        onSubmit={handleCreateLab}
      />

      {/* Edit Basic Info Modal */}
      <EditBasicInfoModal
        isOpen={isEditBasicInfoOpen}
        onClose={() => setIsEditBasicInfoOpen(false)}
        onSubmit={handleSaveBasicInfo}
        course={safeCourse}
      />
    </div>
  );
}

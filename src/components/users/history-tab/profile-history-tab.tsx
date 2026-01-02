import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Clock } from "lucide-react";
import { labSessionService } from "@/services/labSessionService";
import FilterBar from "@/components/ui/filter-bar";
import {
  LabHistoryResponse,
  UserLabSession,
  LabSessionStatistic,
} from "@/types/labSesion";
import { HistoryDetailDialog } from "./history-detail-dialog";
import { HistoryTable } from "./history-table";

interface HistoryTabProps {
  historyData: LabHistoryResponse | null;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearch: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function HistoryTab({
  historyData,
  isLoading,
  searchInput,
  setSearchInput,
  handleSearch,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  setCurrentPage,
  setPageSize,
}: HistoryTabProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UserLabSession | null>(
    null
  );
  const [statisticData, setStatisticData] =
    useState<LabSessionStatistic | null>(null);
  const [isLoadingStatistic, setIsLoadingStatistic] = useState(false);

  const handleViewDetail = async (session: UserLabSession) => {
    setSelectedSession(session);
    setIsDetailOpen(true);
    setIsLoadingStatistic(true);

    try {
      const response = await labSessionService.getLabSessionStatistic(
        session.sessionId
      );
      setStatisticData(response);
    } catch (error) {
      console.error("Failed to fetch session statistic:", error);
    } finally {
      setIsLoadingStatistic(false);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedSession(null);
    setStatisticData(null);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    handleSearch();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lịch sử thực hành
          </CardTitle>
          <div className="mt-4">
            <FilterBar
              searchTerm={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearch}
              onSearchClear={handleSearchClear}
              placeholder="Tìm kiếm theo tên bài lab..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <HistoryTable
            data={historyData?.data || []}
            isLoading={isLoading}
            onViewDetail={handleViewDetail}
          />

          {historyData && historyData.data.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              loading={isLoading}
              showInfo={true}
              showPageSizeSelector={true}
              pageSizeOptions={[5, 10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>

      <HistoryDetailDialog
        open={isDetailOpen}
        onClose={handleCloseDetail}
        statisticData={statisticData}
        isLoading={isLoadingStatistic}
      />
    </>
  );
}

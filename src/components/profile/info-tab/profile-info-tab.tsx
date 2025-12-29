// src/components/profile/profile-info-tab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { User as UserType } from "@/types/user";

interface ProfileInfoTabProps {
  profileData: UserType | null;
  isLoading: boolean;
}

export function ProfileInfoTab({
  profileData,
  isLoading,
}: ProfileInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Thông tin cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : profileData ? (
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Username
                </label>
                <p className="mt-1 text-lg">{profileData.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="mt-1 text-lg">{profileData.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Họ</label>
                <p className="mt-1 text-lg">{profileData.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tên</label>
                <p className="mt-1 text-lg">{profileData.lastName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Vai trò
                </label>
                <p className="mt-1 text-lg">
                  <Badge>{profileData.roleName}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Ngày tạo
                </label>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Không tìm thấy thông tin người dùng
          </p>
        )}
      </CardContent>
    </Card>
  );
}

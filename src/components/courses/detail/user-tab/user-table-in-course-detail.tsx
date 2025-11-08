import { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { User } from "@/types/user";

interface UserTableProps {
  users: User[];
  loading: boolean;

  onDelete: (user: User) => void;
}

export const UserTableCourseDetail: FC<UserTableProps> = ({
  users,
  loading,

  onDelete,
}) => {
  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left w-[60px] font-bold">ID</TableHead>
              <TableHead className="text-left font-bold">Tài khoản</TableHead>
              <TableHead className="text-left font-bold">Tên</TableHead>
              <TableHead className="text-left font-bold">Email</TableHead>
              <TableHead className="text-left font-bold">
                Số điện thoại
              </TableHead>
              <TableHead className="text-left font-bold w-[100px]">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground text-lg">Chưa có người dùng</p>
        <p className="text-sm text-muted-foreground mt-2">
          Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-left font-bold text-gray-900">
              Tài khoản
            </TableHead>
            <TableHead className="text-left font-bold text-gray-900">
              Tên
            </TableHead>
            <TableHead className="text-left font-bold text-gray-900">
              Email
            </TableHead>
            <TableHead className="text-left font-bold text-gray-900">
              Số điện thoại
            </TableHead>
            <TableHead className="text-center font-bold text-gray-900">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell className="text-left font-medium">
                {user.username}
              </TableCell>
              <TableCell className="text-left font-medium">
                {user.lastName} {user.firstName}
              </TableCell>
              <TableCell className="text-left font-medium">
                {user.email}
              </TableCell>
              <TableCell className="text-left font-medium">
                {user.phoneNumber || "-"}
              </TableCell>
              <TableCell className="text-center align-middle">
                <div className="flex justify-center items-center">
                  <Trash2
                    onClick={() => onDelete(user)}
                    className="text-red-600 cursor-pointer hover:text-red-700 transition"
                    size={18}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

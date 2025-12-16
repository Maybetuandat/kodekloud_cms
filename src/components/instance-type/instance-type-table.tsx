import { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { InstanceType } from "@/types/instanceType";
interface InstanceTypeTableProps {
  instanceTypes: InstanceType[];
  loading: boolean;
  onEdit: (instanceType: InstanceType) => void;
  onDelete: (instanceType: InstanceType) => void;
}

export const InstanceTypeTable: FC<InstanceTypeTableProps> = ({
  instanceTypes,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>CPU (cores)</TableHead>
              <TableHead>Memory (GB)</TableHead>
              <TableHead className="hidden md:table-cell">Mô tả</TableHead>
              <TableHead className="hidden md:table-cell">
                Hệ điều hành
              </TableHead>
              <TableHead className="w-[80px] text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell colSpan={6}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (instanceTypes.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>CPU (cores)</TableHead>
              <TableHead>Memory (GB)</TableHead>

              <TableHead className="">Hệ điều hành</TableHead>
              <TableHead className="w-[80px] text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Không có loại instance nào được tìm thấy.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>CPU (cores)</TableHead>
            <TableHead>Memory (GB)</TableHead>
            <TableHead className="hidden md:table-cell">Hệ điều hành</TableHead>
            <TableHead className="w-[80px] text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instanceTypes.map((instanceType, index) => (
            <TableRow key={instanceType.id + Date.now()}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{instanceType.name}</TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {instanceType.cpuCores}
                </code>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {instanceType.memoryGb}
                </code>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {instanceType.backingImage ? (
                  <span className="text-sm line-clamp-2">
                    {instanceType.backingImage}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(instanceType)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(instanceType)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

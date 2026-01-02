// import { useParams } from "react-router-dom";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function ProfilePage() {
//   const { id } = useParams<{ id: string }>();
//   const userId = id ? Number(id) : undefined;

//   return (
//     <div className="flex flex-col min-h-screen bg-background">
//       <div className="flex-1 overflow-auto">
//         <div className="container mx-auto p-6 space-y-8">
//           {/* Section 1: Profile Header (Ảnh đại diện bo tròn) */}
//           <div className="flex flex-col items-center md:flex-row md:items-end gap-6 pb-6 border-b">
//             {isLoadingProfile ? (
//               <Skeleton className="h-32 w-32 rounded-full" />
//             ) : (
//               <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
//                 <AvatarImage
//                   src={profileData?.avatarUrl}
//                   alt={profileData?.fullName}
//                   className="object-cover"
//                 />
//                 <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
//                   {profileData?.fullName?.charAt(0) || "U"}
//                 </AvatarFallback>
//               </Avatar>
//             )}

//             <div className="flex-1 text-center md:text-left space-y-1">
//               {isLoadingProfile ? (
//                 <>
//                   <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
//                   <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
//                 </>
//               ) : (
//                 <>
//                   <h1 className="text-3xl font-bold tracking-tight">
//                     {profileData?.fullName || "Họ và tên"}
//                   </h1>
//                   <p className="text-muted-foreground">
//                     {profileData?.email || "email@example.com"}
//                   </p>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

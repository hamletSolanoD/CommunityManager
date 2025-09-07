"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, User } from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Cursos",
      href: "/editor/course",
      icon: BookOpen,
    },
    {
      label: "Atlas",
      href: "/editor/atlas",
      icon: Users,
    },
    {
      label: "Perfil",
      href: "/editor/perfil",
      icon: User,
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Atlas Community</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
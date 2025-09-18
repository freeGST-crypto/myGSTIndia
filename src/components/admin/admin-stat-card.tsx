
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

type StatItem = {
  label: string;
  value: string;
};

type AdminStatCardProps = {
  title: string;
  icon: LucideIcon;
  mainValue?: string;
  subValue?: string;
  items?: StatItem[];
};

export function AdminStatCard({
  title,
  icon: Icon,
  mainValue,
  subValue,
  items,
}: AdminStatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {mainValue && (
          <>
            <div className="text-2xl font-bold">{mainValue}</div>
            <p className="text-xs text-muted-foreground">{subValue}</p>
          </>
        )}
        {items && (
          <ul className="space-y-1 pt-2">
            {items.map((item) => (
              <li
                key={item.label}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

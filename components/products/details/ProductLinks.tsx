"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ProductLinksProps {
  links: Array<{
    title: string;
    url: string;
    price: number;
    city: string;
    warranty: string;
    option_values?: Record<string, string>;
  }>;
  options?: Array<{
    name: string;
    values: string[];
  }>;
}

export default function ProductLinks({ links, options }: ProductLinksProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // فیلتر کردن لینک‌ها بر اساس انتخاب‌های کاربر
  const filteredLinks = links.filter((link) => {
    if (!selectedOptions || !link.option_values) return true;
    return Object.entries(selectedOptions).every(
      ([key, value]) => !value || link.option_values?.[key] === value
    );
  });

  // گروه‌بندی لینک‌ها بر اساس یه option خاص (مثلاً اولین option یا city)
  const groupByOption = options?.[0]?.name || "city"; // می‌تونی این رو تغییر بدی
  const groupedLinks = filteredLinks.reduce((acc, link) => {
    const key = link.option_values?.[groupByOption] || (groupByOption === 'city' ? link.city : "Unknown");
    if (!acc[key]) acc[key] = [];
    acc[key].push(link);
    return acc;
  }, {} as Record<string, typeof filteredLinks>);

  return (
    <Card className="p-6  ">
      {options && options.length > 0 && (
        <div className="mb-4 space-y-4">
          <h3 className="font-medium">Options</h3>
          <div className="flex flex-wrap gap-4">
            {options.map((option) => (
              <div key={option.name} className="w-[200px]">
                <Label>{option.name}</Label>
                <Select
                  value={selectedOptions[option.name] || "all"}
                  onValueChange={(value) => {
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [option.name]: value === "all" ? "" : value,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${option.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {option.name}s</SelectItem>
                    {option.values.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Available Offers</h2>
      <div className="space-y-6">
        {Object.entries(groupedLinks).map(([groupKey, groupLinks], index) => (
          <div key={groupKey}>
            {/* خط جداکننده و عنوان */}
            {index > 0 && <hr className="my-4 border-gray-200" />}
            <h3 className="text-lg font-medium mb-2">
              {groupByOption.charAt(0).toUpperCase() + groupByOption.slice(1)}: {groupKey}
            </h3>
            {/* لینک‌ها */}
            <div className="space-y-4">
              {groupLinks.map((link, linkIndex) => (
                <Button
                  key={linkIndex}
                  variant="outline"
                  className="w-full justify-between py-6"
                  asChild
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-lg justify-between w-full"
                  >
                    <div className="flex flex-col">
                      <span>{link.title} - ${Number(link.price).toFixed(2)}</span>
                      <span className="text-sm text-gray-500">
                        {link.city} • {link.warranty}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
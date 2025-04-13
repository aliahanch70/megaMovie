"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProductLinksProps {
  links: Array<{
    title: string;
    url: string;
    price: number;
    city: string;
    warranty: string;
    option_values?: Record<string, string>;
    quality?: string;
    size?: string;
    encode?: string;
    website?: string;
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
  const groupByOption = options?.[0]?.name || "city";
  const groupedLinks = filteredLinks.reduce((acc, link) => {
    const key = link.option_values?.[groupByOption] || (groupByOption === 'city' ? link.city : "Unknown");
    if (!acc[key]) acc[key] = [];
    acc[key].push(link);
    return acc;
  }, {} as Record<string, typeof filteredLinks>);

  console.log("Grouped Links:", groupedLinks);
  console.log("Selected Options:", selectedOptions);
  console.log("Filtered Links:", filteredLinks);
  console.log("Options:", options);
  console.log("Links:", links);

  return (
    <Card className="p-6">
      <Label className="text-lg font-medium">Download Box</Label>
      {options && options.length > 0 && (
        <div className="mb-4 space-y-4">
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

      
      <div className="space-y-6">
        {options && options.length > 0 ? (
          // وقتی options وجود دارد، از Accordion استفاده کن
          Object.entries(groupedLinks).map(([groupKey, groupLinks], index) => (
            <div key={groupKey}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={groupKey}>
                  <AccordionTrigger
                    className="text-lg font-medium"
                  >
                    {groupByOption.charAt(0).toUpperCase() + groupByOption.slice(1)}: {groupKey} ({groupLinks.length})
                  </AccordionTrigger>
                  <AccordionContent>
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
                              <span>{link.title} - {link.website}</span>
                              <span className="text-sm text-gray-500">
                                {link.quality} • {link.size} • {link.encode}
                              </span>
                            </div>
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))
        ) : (
          // وقتی options وجود ندارد، همه لینک‌ها را نمایش بده
          <div className="space-y-4">
            {filteredLinks.map((link, linkIndex) => (
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
                    <span>{link.title} - {link.website}</span>
                    <span className="text-sm text-gray-500">
                      {link.quality} • {link.size} • {link.encode}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
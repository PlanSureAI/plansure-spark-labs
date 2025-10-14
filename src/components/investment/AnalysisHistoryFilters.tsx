import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface AnalysisFilters {
  dateRange: { from: Date | undefined; to: Date | undefined };
  irrRange: string;
  riskLevel: string;
  npvRange: string;
  propertyType: string;
  city: string;
  state: string;
  country: string;
}

interface AnalysisHistoryFiltersProps {
  filters: AnalysisFilters;
  onFiltersChange: (filters: AnalysisFilters) => void;
  properties: any[];
}

export const AnalysisHistoryFilters = ({
  filters,
  onFiltersChange,
  properties,
}: AnalysisHistoryFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof AnalysisFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      irrRange: "all",
      riskLevel: "all",
      npvRange: "all",
      propertyType: "all",
      city: "all",
      state: "all",
      country: "all",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange.from !== undefined ||
      filters.dateRange.to !== undefined ||
      filters.irrRange !== "all" ||
      filters.riskLevel !== "all" ||
      filters.npvRange !== "all" ||
      filters.propertyType !== "all" ||
      filters.city !== "all" ||
      filters.state !== "all" ||
      filters.country !== "all"
    );
  };

  // Extract unique values from properties
  const uniquePropertyTypes = [...new Set(properties.map(p => p.property_type).filter(Boolean))];
  const uniqueCities = [...new Set(properties.map(p => p.city).filter(Boolean))];
  const uniqueStates = [...new Set(properties.map(p => p.state).filter(Boolean))];
  const uniqueCountries = [...new Set(properties.map(p => p.country).filter(Boolean))];

  const activeFilterCount = [
    filters.dateRange.from || filters.dateRange.to,
    filters.irrRange !== "all",
    filters.riskLevel !== "all",
    filters.npvRange !== "all",
    filters.propertyType !== "all",
    filters.city !== "all",
    filters.state !== "all",
    filters.country !== "all",
  ].filter(Boolean).length;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Filter Toggle Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="gap-1"
              >
                <X className="w-3 h-3" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            {/* Date Range Filter */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="flex gap-2 flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, "PPP")
                      ) : (
                        <span>From date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) =>
                        updateFilter("dateRange", { ...filters.dateRange, from: date })
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, "PPP")
                      ) : (
                        <span>To date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) =>
                        updateFilter("dateRange", { ...filters.dateRange, to: date })
                      }
                      disabled={(date) =>
                        filters.dateRange.from ? date < filters.dateRange.from : false
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Financial Metrics Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">IRR Range</Label>
                <Select
                  value={filters.irrRange}
                  onValueChange={(value) => updateFilter("irrRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All IRR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All IRR</SelectItem>
                    <SelectItem value="high">High (&gt; 15%)</SelectItem>
                    <SelectItem value="medium">Medium (10-15%)</SelectItem>
                    <SelectItem value="low">Low (&lt; 10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Risk Level</Label>
                <Select
                  value={filters.riskLevel}
                  onValueChange={(value) => updateFilter("riskLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Risk Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low (&lt; 30)</SelectItem>
                    <SelectItem value="moderate">Moderate (30-60)</SelectItem>
                    <SelectItem value="high">High (&gt; 60)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">NPV Range</Label>
                <Select
                  value={filters.npvRange}
                  onValueChange={(value) => updateFilter("npvRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All NPV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All NPV</SelectItem>
                    <SelectItem value="positive-high">High Positive (&gt; $100k)</SelectItem>
                    <SelectItem value="positive-medium">Medium Positive ($0-$100k)</SelectItem>
                    <SelectItem value="negative">Negative (&lt; $0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Geographic and Property Type Filters */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Property Type</Label>
                <Select
                  value={filters.propertyType}
                  onValueChange={(value) => updateFilter("propertyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniquePropertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <Select
                  value={filters.city}
                  onValueChange={(value) => updateFilter("city", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {uniqueCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">State</Label>
                <Select
                  value={filters.state}
                  onValueChange={(value) => updateFilter("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {uniqueStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Country</Label>
                <Select
                  value={filters.country}
                  onValueChange={(value) => updateFilter("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {uniqueCountries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { MapPin, Globe2, TrendingUp, Users, Award } from "lucide-react";
import { usePermissions } from "@/contexts/PermissionsContext";
import worldMapData from "@/assets/world-countries-110m.json";
import { Badge } from "@/components/ui/badge";

type CountryCounts = Record<string, number>;

export function DocumentCountryMap() {
  const [counts, setCounts] = useState<CountryCounts>({});
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { getAccessibleBranches } = usePermissions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessibleBranches = getAccessibleBranches();
        
        // Fetch document_tracker with employee join to filter by branch
        const { data, error } = await supabase
          .from("document_tracker")
          .select("country, employee_id, employees!inner(branch_id)");
        
        if (error) throw error;
        
        // Filter by accessible branches and count unique employees per country
        const employeesByCountry: Record<string, Set<string>> = {};
        (data || []).forEach((row: any) => {
          const country = (row?.country || "").trim();
          const employeeId = row?.employee_id;
          const branchId = row?.employees?.branch_id;
          
          if (!country || !employeeId) return;
          
          // Filter by accessible branches
          if (accessibleBranches.length > 0 && !accessibleBranches.includes(branchId)) {
            return;
          }
          
          const key = country.toLowerCase();
          if (!employeesByCountry[key]) {
            employeesByCountry[key] = new Set();
          }
          employeesByCountry[key].add(employeeId);
        });
        
        // Convert to counts
        const map: CountryCounts = {};
        Object.entries(employeesByCountry).forEach(([country, employeeSet]) => {
          map[country] = employeeSet.size;
        });
        
        setCounts(map);
      } catch (e) {
        console.error("Failed to load employee country distribution", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAccessibleBranches]);

  const max = useMemo(() => {
    return Object.values(counts).reduce((a, b) => Math.max(a, b), 0) || 0;
  }, [counts]);

  const getFill = (value: number) => {
    if (value <= 0) return "hsl(var(--muted) / 0.3)";
    const ratio = value / Math.max(1, max);
    if (ratio > 0.75) return "hsl(var(--primary) / 0.9)";
    if (ratio > 0.5) return "hsl(var(--primary) / 0.75)";
    if (ratio > 0.25) return "hsl(var(--primary) / 0.6)";
    return "hsl(var(--primary) / 0.45)";
  };

  const totalEmployees = useMemo(() => {
    return Object.values(counts).reduce((a, b) => a + b, 0);
  }, [counts]);

  const topCountries = useMemo(() => {
    return Object.entries(counts)
      .map(([country, count]) => ({
        country: country.charAt(0).toUpperCase() + country.slice(1),
        count,
        percentage: totalEmployees > 0 ? ((count / totalEmployees) * 100).toFixed(1) : "0.0"
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [counts, totalEmployees]);

  const countriesCount = useMemo(() => Object.keys(counts).length, [counts]);

  return (
    <div className="w-full">
      {/* Combined Card */}
      <div className="group card-premium p-8 relative overflow-hidden animate-fade-in border-2">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl -z-10" />
        
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Globe2 className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Global Workforce Distribution
              </h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Real-time geographic insights from document records
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="text-right px-4 py-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
              <div className="text-xs text-muted-foreground mb-1">Countries</div>
              <div className="text-2xl font-bold text-primary">{countriesCount}</div>
            </div>
            <div className="text-right px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20">
              <div className="text-xs text-muted-foreground mb-1">Total Staff</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalEmployees}</div>
            </div>
          </div>
        </div>

        <div className="w-full aspect-[2/1] rounded-2xl border-2 bg-gradient-to-br from-background via-background/95 to-muted/30 overflow-hidden shadow-xl relative mb-8">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
                <Globe2 className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">Loading global data...</p>
            </div>
          ) : mapError ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm font-medium mb-1">Map Temporarily Unavailable</p>
                <p className="text-xs text-muted-foreground">Please try again later</p>
              </div>
            </div>
          ) : (
            <ComposableMap 
              projection="geoMercator"
              projectionConfig={{ 
                scale: 100,
                center: [0, 0]
              }}
              width={800}
              height={400}
              style={{ width: "100%", height: "100%" }}
              className="transition-all duration-500 hover:scale-[1.02]"
            >
              <Geographies 
                geography={worldMapData}
                onError={(error) => {
                  console.error("Map loading error:", error);
                  setMapError(true);
                }}
              >
                {({ geographies }) => {
                  if (!mapLoaded) {
                    console.log("Map geographies loaded:", geographies.length);
                    setMapLoaded(true);
                  }
                  return geographies.map((geo) => {
                    const rawName =
                      (geo.properties?.name as string) ||
                      (geo.properties?.NAME as string) ||
                      (geo.properties?.NAME_LONG as string) ||
                      "";
                    const key = rawName.toLowerCase();
                    const value = counts[key] || 0;
                    const percentage = totalEmployees > 0 ? ((value / totalEmployees) * 100).toFixed(1) : "0.0";
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getFill(value)}
                        stroke="hsl(var(--border) / 0.3)"
                        strokeWidth={0.5}
                        style={{
                          default: { 
                            outline: "none",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          },
                          hover: { 
                            fill: "hsl(var(--primary) / 0.85)", 
                            outline: "none",
                            stroke: "hsl(var(--primary))",
                            strokeWidth: 2,
                            cursor: "pointer",
                            filter: "brightness(1.1)"
                          },
                          pressed: { 
                            fill: "hsl(var(--primary) / 0.95)", 
                            outline: "none"
                          },
                        }}
                      >
                        <title>
                          {rawName}: {value} employee{value !== 1 ? 's' : ''} ({percentage}%)
                        </title>
                      </Geography>
                    );
                  });
                }}
              </Geographies>
            </ComposableMap>
          )}
        </div>

        {/* Top Countries Statistics - Integrated */}
        <div className="space-y-6 pt-6 border-t-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Top Locations</h3>
                <p className="text-sm text-muted-foreground">Leading countries by workforce size</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs px-3 py-1.5 gap-2 border-2">
              <Users className="w-3.5 h-3.5" />
              {totalEmployees} Total Employees
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {topCountries.map((item, index) => {
              const isTopThree = index < 3;
              const medalColors = ['from-amber-500 to-yellow-500', 'from-gray-400 to-gray-500', 'from-orange-600 to-amber-700'];
              
              return (
                <div 
                  key={item.country} 
                  className="group relative flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/30 via-muted/20 to-transparent border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                {/* Rank badge */}
                <div className="flex items-center gap-4 flex-1">
                  {isTopThree ? (
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${medalColors[index]} shadow-lg`}>
                      <Award className="w-5 h-5 text-white" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-current flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-base group-hover:text-primary transition-colors">
                        {item.country}
                      </span>
                      {isTopThree && (
                        <Badge variant="outline" className="text-xs">
                          Top {index + 1}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="relative w-full h-2.5 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full transition-all duration-700 ease-out group-hover:from-primary group-hover:via-primary/95 group-hover:to-primary/90"
                        style={{ 
                          width: `${item.percentage}%`,
                          boxShadow: '0 0 10px hsl(var(--primary) / 0.3)'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-6 ml-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.count}
                    </div>
                    <div className="text-xs text-muted-foreground">employees</div>
                  </div>
                  <div className="text-right min-w-[3rem]">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
                </div>
              );
            })}
          </div>

          {/* Summary footer */}
          {topCountries.length > 0 && (
            <div className="pt-4 mt-2 border-t-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing top {topCountries.length} of {countriesCount} countries
              </span>
              <span className="text-muted-foreground">
                Coverage: <span className="font-semibold text-foreground">
                  {topCountries.reduce((sum, c) => sum + parseFloat(c.percentage), 0).toFixed(1)}%
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

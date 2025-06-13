
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useView } from '@/contexts/view-context';

interface ModuleCardWrapperProps {
  id?: string; // Renamed from moduleId for consistency with page.tsx usage
  title: string;
  description: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  isLoading?: boolean;
}

export const ModuleCardWrapper: React.FC<ModuleCardWrapperProps> = React.forwardRef<HTMLDivElement, ModuleCardWrapperProps>(
  ({ id, title, description, icon: Icon, children, footerContent, className, contentClassName, isLoading }, ref) => {
    const { expandedModuleId, setExpandedModuleId } = useView();
    const isExpanded = expandedModuleId === id;

    const handleToggleExpand = () => {
      if (id) {
        setExpandedModuleId(isExpanded ? null : id);
      }
    };

    return (
      <Card className={cn("flex flex-col h-full shadow-lg", className)} ref={ref} id={id}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {Icon && <Icon className="h-6 w-6 mr-3 text-primary" />}
              <CardTitle className="font-headline text-xl">{title}</CardTitle>
            </div>
            {id && ( // Only show expand/minimize button if an ID is provided
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleToggleExpand} className="h-8 w-8">
                      {isExpanded ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isExpanded ? "Restaurar Módulo" : "Ampliar Módulo"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className={cn("flex-grow relative", contentClassName, isLoading ? 'opacity-50 pointer-events-none' : '')}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10 rounded-md">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {children}
        </CardContent>
        {footerContent && <CardFooter>{footerContent}</CardFooter>}
      </Card>
    );
  }
);

ModuleCardWrapper.displayName = 'ModuleCardWrapper';

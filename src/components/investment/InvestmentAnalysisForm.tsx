import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp } from "lucide-react";

const formSchema = z.object({
  property_id: z.string().optional(),
  purchase_price: z.number().min(1000, "Purchase price must be at least $1,000"),
  down_payment_percent: z.number().min(0).max(100, "Must be between 0-100%"),
  loan_interest_rate: z.number().min(0).max(30, "Must be between 0-30%"),
  loan_term_years: z.number().min(1).max(30, "Must be between 1-30 years"),
  annual_rental_income: z.number().min(0, "Must be positive"),
  vacancy_rate: z.number().min(0).max(100, "Must be between 0-100%"),
  annual_operating_expenses: z.number().min(0, "Must be positive"),
  annual_property_appreciation: z.number().min(-10).max(20, "Must be between -10% and 20%"),
  holding_period_years: z.number().min(1).max(30, "Must be between 1-30 years"),
});

type FormValues = z.infer<typeof formSchema>;

interface InvestmentAnalysisFormProps {
  properties: any[];
  onAnalysisComplete: (analysis: any) => void;
}

export const InvestmentAnalysisForm = ({
  properties,
  onAnalysisComplete,
}: InvestmentAnalysisFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchase_price: 500000,
      down_payment_percent: 20,
      loan_interest_rate: 6.5,
      loan_term_years: 30,
      annual_rental_income: 36000,
      vacancy_rate: 5,
      annual_operating_expenses: 12000,
      annual_property_appreciation: 3,
      holding_period_years: 5,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("analyze-investment", {
        body: values,
      });

      if (response.error) throw response.error;
      if (!response.data?.success) throw new Error("Analysis failed");

      onAnalysisComplete(response.data.analysis);
      
      toast({
        title: "Analysis complete!",
        description: "Your investment metrics have been calculated.",
      });
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Investment Parameters
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your investment details for AI-powered ROI analysis
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {properties.length > 0 && (
              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {properties.map((prop) => (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="down_payment_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Down Payment (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loan_interest_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loan_term_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Term (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="annual_rental_income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Rental Income ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vacancy_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vacancy Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annual_operating_expenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Expenses ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="annual_property_appreciation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Appreciation (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="holding_period_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holding Period (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Investment...
                </>
              ) : (
                "Generate Analysis"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
};

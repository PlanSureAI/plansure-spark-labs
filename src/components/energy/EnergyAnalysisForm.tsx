import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface EnergyAnalysisFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export const EnergyAnalysisForm = ({ onSubmit, isLoading }: EnergyAnalysisFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm();
  const { currentWorkspace } = useWorkspace();
  const [upgrades, setUpgrades] = useState({
    heat_pump: false,
    insulation: false,
    smart_controls: false,
  });

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      workspace_id: currentWorkspace?.id,
      heat_pump_installed: upgrades.heat_pump,
      insulation_upgrade: upgrades.insulation,
      smart_controls: upgrades.smart_controls,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Building Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building_type">Building Type</Label>
              <Select onValueChange={(value) => setValue('building_type', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detached">Detached House</SelectItem>
                  <SelectItem value="semi-detached">Semi-Detached</SelectItem>
                  <SelectItem value="terraced">Terraced House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="bungalow">Bungalow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor_area_sqft">Floor Area (sq ft)</Label>
              <Input
                id="floor_area_sqft"
                type="number"
                {...register('floor_area_sqft', { required: true })}
                placeholder="e.g., 1500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_built">Year Built</Label>
              <Input
                id="year_built"
                type="number"
                {...register('year_built')}
                placeholder="e.g., 1980"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="climate_zone">Climate Zone</Label>
              <Select onValueChange={(value) => setValue('climate_zone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperate">Temperate</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Current Energy Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_annual_energy_kwh">Annual Energy (kWh)</Label>
              <Input
                id="current_annual_energy_kwh"
                type="number"
                {...register('current_annual_energy_kwh')}
                placeholder="e.g., 12000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_annual_cost">Annual Cost (£)</Label>
              <Input
                id="current_annual_cost"
                type="number"
                {...register('current_annual_cost')}
                placeholder="e.g., 2400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_annual_carbon_kg">Annual Carbon (kg CO2)</Label>
              <Input
                id="current_annual_carbon_kg"
                type="number"
                {...register('current_annual_carbon_kg')}
                placeholder="e.g., 3000"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Proposed Upgrades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="solar_panel_kw">Solar Panel Capacity (kW)</Label>
              <Input
                id="solar_panel_kw"
                type="number"
                step="0.1"
                {...register('solar_panel_kw')}
                placeholder="e.g., 4.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="battery_storage_kwh">Battery Storage (kWh)</Label>
              <Input
                id="battery_storage_kwh"
                type="number"
                step="0.1"
                {...register('battery_storage_kwh')}
                placeholder="e.g., 10.0"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <Label htmlFor="heat_pump">Heat Pump Installation</Label>
              <Switch
                id="heat_pump"
                checked={upgrades.heat_pump}
                onCheckedChange={(checked) => setUpgrades(prev => ({ ...prev, heat_pump: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <Label htmlFor="insulation">Insulation Upgrade</Label>
              <Switch
                id="insulation"
                checked={upgrades.insulation}
                onCheckedChange={(checked) => setUpgrades(prev => ({ ...prev, insulation: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <Label htmlFor="smart_controls">Smart Controls</Label>
              <Switch
                id="smart_controls"
                checked={upgrades.smart_controls}
                onCheckedChange={(checked) => setUpgrades(prev => ({ ...prev, smart_controls: checked }))}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Analyzing...' : 'Analyze Energy & Carbon Impact'}
        </Button>
      </Card>
    </form>
  );
};

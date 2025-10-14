import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Target, TrendingUp } from "lucide-react";

interface CertificationScoringProps {
  analysisId: string;
  certifications: any[];
}

export const CertificationScoring = ({ analysisId, certifications }: CertificationScoringProps) => {
  const getCertificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'BREEAM': 'bg-green-600',
      'PassivHaus': 'bg-blue-600',
      'Zero Carbon': 'bg-emerald-600',
      'LEED': 'bg-teal-600',
      'WELL': 'bg-purple-600'
    };
    return colors[type] || 'bg-gray-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Green Certification Pathways</h3>
        <Button variant="outline">
          <Target className="w-4 h-4 mr-2" />
          Set Certification Goals
        </Button>
      </div>

      {certifications.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Certifications Tracked</h4>
          <p className="text-muted-foreground mb-4">
            Start tracking green building certifications to monitor your sustainability goals
          </p>
          <Button>Add Certification Target</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certifications.map((cert) => (
            <Card key={cert.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getCertificationColor(cert.certification_type)}`} />
                    <h4 className="font-bold text-lg">{cert.certification_type}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(cert.status)}
                    <Badge variant={cert.status === 'achieved' ? 'default' : 'secondary'}>
                      {cert.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {cert.awarded_date && (
                  <Badge variant="outline">
                    Awarded: {new Date(cert.awarded_date).toLocaleDateString()}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Current Score</span>
                    <span className="font-bold">{cert.current_score || 0} / {cert.target_score || 100}</span>
                  </div>
                  <Progress 
                    value={((cert.current_score || 0) / (cert.target_score || 100)) * 100} 
                    className="h-3"
                  />
                </div>

                {cert.assessment_data?.embodied_carbon && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Embodied Carbon</p>
                      <p className="font-semibold">{cert.assessment_data.embodied_carbon} kg CO₂e</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Operational Carbon</p>
                      <p className="font-semibold">{cert.assessment_data.operational_carbon} kg CO₂e/yr</p>
                    </div>
                  </div>
                )}

                {cert.improvement_recommendations && cert.improvement_recommendations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Key Recommendations:</p>
                    <ul className="space-y-1">
                      {cert.improvement_recommendations.slice(0, 3).map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button variant="outline" className="w-full mt-4">
                  View Full Assessment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

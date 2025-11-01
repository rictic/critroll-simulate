import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PF2eRollSimulator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dc, setDc] = useState(() => parseInt(searchParams.get('dc')) || 15);
  const [modifier, setModifier] = useState(() => parseInt(searchParams.get('modifier')) || 5);
  const [damageRoll, setDamageRoll] = useState(() => searchParams.get('damageRoll') || '');
  const [isAgile, setIsAgile] = useState(() => searchParams.get('isAgile') === 'true');
  const [results, setResults] = useState(null);
  const [damageHistogram, setDamageHistogram] = useState([]);
  const [dcDamageData, setDcDamageData] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('dc', dc);
    params.set('modifier', modifier);
    if (damageRoll) params.set('damageRoll', damageRoll);
    params.set('isAgile', isAgile);
    setSearchParams(params);
  }, [dc, modifier, damageRoll, isAgile, setSearchParams]);

  const parseDamageRoll = (damageString) => {
    const match = damageString.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
    if (!match) return null;
    const [, numDice, diceType, bonus] = match;
    return { numDice: parseInt(numDice), diceType: parseInt(diceType), bonus: parseInt(bonus) || 0 };
  };

  const rollDamage = (damageRoll) => {
    const { numDice, diceType, bonus } = damageRoll;
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * diceType) + 1;
    }
    return total + bonus;
  };

  const simulateRolls = (iterations = 100000) => {
    const damageRollParsed = parseDamageRoll(damageRoll);
    const penalties = isAgile ? [-0, -4, -8] : [-0, -5, -10];
    const results = penalties.map(() => ({
      critSuccess: 0,
      success: 0,
      failure: 0,
      critFailure: 0,
      totalDamage: 0
    }));
    const damageHistogram = {};

    for (let i = 0; i < iterations; i++) {
      penalties.forEach((penalty, index) => {
        let roll = Math.floor(Math.random() * 20) + 1;
        let total = (roll === 1) ? -9 + modifier + penalty :
                    (roll === 20) ? 30 + modifier + penalty :
                    roll + modifier + penalty;

        let damage = 0;
        if (total >= dc + 10) {
          results[index].critSuccess++;
          if (damageRollParsed) damage = rollDamage(damageRollParsed) * 2;
        } else if (total >= dc) {
          results[index].success++;
          if (damageRollParsed) damage = rollDamage(damageRollParsed);
        } else if (total >= dc - 10) {
          results[index].failure++;
        } else {
          results[index].critFailure++;
        }

        results[index].totalDamage += damage;

        // Only collect histogram data for the first attack
        if (index === 0 && damageRollParsed) {
          damageHistogram[damage] = (damageHistogram[damage] || 0) + 1;
        }
      });
    }

    setResults(results.map((result, index) => ({
      penalty: penalties[index],
      critSuccess: Math.round(result.critSuccess / iterations * 100),
      success: Math.round(result.success / iterations * 100),
      failure: Math.round(result.failure / iterations * 100),
      critFailure: Math.round(result.critFailure / iterations * 100),
      averageDamage: damageRollParsed ? Math.round((result.totalDamage / iterations) * 100) / 100 : null
    })));

    // Convert histogram data to chart format
    if (damageRollParsed) {
      const histogramData = Object.entries(damageHistogram).map(([damage, count]) => ({
        damage: parseInt(damage),
        frequency: (count / iterations) * 100
      })).sort((a, b) => a.damage - b.damage);
      setDamageHistogram(histogramData);
    } else {
      setDamageHistogram([]);
    }
  };

  useEffect(() => {
    simulateRolls();
    calculateDcDamageData();
  }, [dc, modifier, damageRoll, isAgile]);

  const calculateDcDamageData = () => {
    const damageRollParsed = parseDamageRoll(damageRoll);
    if (!damageRollParsed) {
      setDcDamageData([]);
      return;
    }

    const dcRange = Array.from({length: 41}, (_, i) => modifier - 20 + i);
    const data = dcRange.map(currentDc => {
      const averageDamage = simulateRollsForDc(currentDc, 10000);
      return { dc: currentDc, averageDamage };
    });
    setDcDamageData(data);
  };

  const simulateRollsForDc = (currentDc, iterations) => {
    const damageRollParsed = parseDamageRoll(damageRoll);
    let totalDamage = 0;

    for (let i = 0; i < iterations; i++) {
      let roll = Math.floor(Math.random() * 20) + 1;
      let total = (roll === 1) ? -9 + modifier :
                  (roll === 20) ? 30 + modifier :
                  roll + modifier;

      let damage = 0;
      if (total >= currentDc + 10) {
        damage = rollDamage(damageRollParsed) * 2;
      } else if (total >= currentDc) {
        damage = rollDamage(damageRollParsed);
      }

      totalDamage += damage;
    }

    return totalDamage / iterations;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-foreground">PF2e Roll Simulator</h1>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <Label htmlFor="dc" className="text-sm font-medium mb-2 block">DC</Label>
              <Input
                id="dc"
                type="number"
                value={dc}
                onChange={(e) => setDc(parseInt(e.target.value) || 0)}
                className="text-lg"
              />
            </div>
            <div>
              <Label htmlFor="modifier" className="text-sm font-medium mb-2 block">Total Modifier</Label>
              <Input
                id="modifier"
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="text-lg"
              />
            </div>
            <div>
              <Label htmlFor="damageRoll" className="text-sm font-medium mb-2 block">Damage Roll (e.g., 2d4+3)</Label>
              <Input
                id="damageRoll"
                type="text"
                value={damageRoll}
                onChange={(e) => setDamageRoll(e.target.value)}
                placeholder="2d4+3"
                className="text-lg"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAgile"
              checked={isAgile}
              onCheckedChange={(checked) => setIsAgile(checked)}
            />
            <Label htmlFor="isAgile" className="text-sm font-medium cursor-pointer">Agile</Label>
          </div>
        </CardContent>
      </Card>
      {results && (
        <div className="grid grid-cols-1 3xl:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-xl">Roll Results</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-2 font-semibold text-sm">Attack</th>
                      <th className="text-right py-3 px-2 font-semibold text-sm">Crit Success</th>
                      <th className="text-right py-3 px-2 font-semibold text-sm">Success</th>
                      <th className="text-right py-3 px-2 font-semibold text-sm">Failure</th>
                      <th className="text-right py-3 px-2 font-semibold text-sm">Crit Failure</th>
                      {damageRoll && <th className="text-right py-3 px-2 font-semibold text-sm">Avg. Damage</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-2 font-medium">{result.penalty === 0 ? 'First' : `${index + 1}${['st', 'nd', 'rd'][index] || 'th'} (${result.penalty})`}</td>
                        <td className="text-right py-3 px-2 font-semibold text-primary">{result.critSuccess}%</td>
                        <td className="text-right py-3 px-2 font-semibold">{result.success}%</td>
                        <td className="text-right py-3 px-2 font-semibold text-muted-foreground">{result.failure}%</td>
                        <td className="text-right py-3 px-2 font-semibold text-destructive">{result.critFailure}%</td>
                        {damageRoll && (
                          <td className="text-right py-3 px-2 font-semibold text-accent-foreground">
                            {result.averageDamage !== null ? `${result.averageDamage}` : 'N/A'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {damageRoll && damageHistogram.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-xl">Damage Histogram (First Attack)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={damageHistogram}>
                    <XAxis 
                      dataKey="damage" 
                      label={{ value: 'Damage', position: 'insideBottom', offset: -5 }}
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft' }}
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="frequency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          {damageRoll && dcDamageData.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-xl">Average Damage by DC</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dcDamageData}>
                    <XAxis 
                      dataKey="dc" 
                      label={{ value: 'DC', position: 'insideBottom', offset: -5 }}
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      label={{ value: 'Average Damage', angle: -90, position: 'insideLeft' }}
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averageDamage" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PF2eRollSimulator;

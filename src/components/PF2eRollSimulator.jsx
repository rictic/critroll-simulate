import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

const PF2eRollSimulator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dc, setDc] = useState(() => parseInt(searchParams.get('dc')) || 15);
  const [modifier, setModifier] = useState(() => parseInt(searchParams.get('modifier')) || 5);
  const [damageRoll, setDamageRoll] = useState(() => searchParams.get('damageRoll') || '');
  const [isAgile, setIsAgile] = useState(() => searchParams.get('isAgile') === 'true');
  const [results, setResults] = useState(null);

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

    for (let i = 0; i < iterations; i++) {
      penalties.forEach((penalty, index) => {
        let roll = Math.floor(Math.random() * 20) + 1;
        let total = (roll === 1) ? -9 + modifier + penalty :
                    (roll === 20) ? 30 + modifier + penalty :
                    roll + modifier + penalty;

        if (total >= dc + 10) {
          results[index].critSuccess++;
          if (damageRollParsed) results[index].totalDamage += rollDamage(damageRollParsed) * 2;
        } else if (total >= dc) {
          results[index].success++;
          if (damageRollParsed) results[index].totalDamage += rollDamage(damageRollParsed);
        } else if (total >= dc - 10) {
          results[index].failure++;
        } else {
          results[index].critFailure++;
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
  };

  useEffect(() => {
    simulateRolls();
  }, [dc, modifier, damageRoll, isAgile]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PF2e Roll Simulator</h1>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="dc">DC</Label>
          <Input
            id="dc"
            type="number"
            value={dc}
            onChange={(e) => setDc(parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="modifier">Total Modifier</Label>
          <Input
            id="modifier"
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="damageRoll">Damage Roll (e.g., 2d4+3)</Label>
          <Input
            id="damageRoll"
            type="text"
            value={damageRoll}
            onChange={(e) => setDamageRoll(e.target.value)}
            placeholder="2d4+3"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="isAgile"
          checked={isAgile}
          onCheckedChange={(checked) => setIsAgile(checked)}
        />
        <Label htmlFor="isAgile">Agile</Label>
      </div>
      {results && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Roll Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-2">
                    {result.penalty === 0 ? 'First Attack' : `${index + 1}${['st', 'nd', 'rd'][index] || 'th'} Attack (${result.penalty} penalty)`}
                  </h3>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Outcome</th>
                        <th className="text-right">Chance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Critical Success</td>
                        <td className="text-right font-bold">{result.critSuccess}%</td>
                      </tr>
                      <tr>
                        <td>Success</td>
                        <td className="text-right font-bold">{result.success}%</td>
                      </tr>
                      <tr>
                        <td>Failure</td>
                        <td className="text-right font-bold">{result.failure}%</td>
                      </tr>
                      <tr>
                        <td>Critical Failure</td>
                        <td className="text-right font-bold">{result.critFailure}%</td>
                      </tr>
                      {result.averageDamage !== null && (
                        <tr>
                          <td>Average Damage per Roll</td>
                          <td className="text-right font-bold">{result.averageDamage}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PF2eRollSimulator;

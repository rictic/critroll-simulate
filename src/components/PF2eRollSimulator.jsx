import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PF2eRollSimulator = () => {
  const [dc, setDc] = useState(15);
  const [modifier, setModifier] = useState(5);
  const [damageRoll, setDamageRoll] = useState('');
  const [results, setResults] = useState(null);

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
    let critSuccess = 0, success = 0, failure = 0, critFailure = 0;
    let totalDamage = 0;
    const damageRollParsed = parseDamageRoll(damageRoll);

    for (let i = 0; i < iterations; i++) {
      let roll = Math.floor(Math.random() * 20) + 1;
      let total;

      if (roll === 1) total = -9 + modifier;
      else if (roll === 20) total = 30 + modifier;
      else total = roll + modifier;

      if (total >= dc + 10) {
        critSuccess++;
        if (damageRollParsed) totalDamage += rollDamage(damageRollParsed) * 2;
      }
      else if (total >= dc) {
        success++;
        if (damageRollParsed) totalDamage += rollDamage(damageRollParsed);
      }
      else if (total >= dc - 10) failure++;
      else critFailure++;
    }

    setResults({
      critSuccess: Math.round(critSuccess / iterations * 100),
      success: Math.round(success / iterations * 100),
      failure: Math.round(failure / iterations * 100),
      critFailure: Math.round(critFailure / iterations * 100),
      averageDamage: damageRollParsed ? Math.round((totalDamage / iterations) * 100) / 100 : null
    });
  };

  useEffect(() => {
    simulateRolls();
  }, [dc, modifier, damageRoll]);

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
            onChange={(e) => setDc(parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="modifier">Total Modifier</Label>
          <Input
            id="modifier"
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value))}
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
      {results && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Roll Results</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <td className="text-right font-bold">{results.critSuccess}%</td>
                </tr>
                <tr>
                  <td>Success</td>
                  <td className="text-right font-bold">{results.success}%</td>
                </tr>
                <tr>
                  <td>Failure</td>
                  <td className="text-right font-bold">{results.failure}%</td>
                </tr>
                <tr>
                  <td>Critical Failure</td>
                  <td className="text-right font-bold">{results.critFailure}%</td>
                </tr>
              </tbody>
            </table>
            {results.averageDamage !== null && (
              <div className="mt-4">
                <strong>Average Damage per Roll:</strong> {results.averageDamage}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PF2eRollSimulator;

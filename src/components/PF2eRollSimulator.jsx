import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PF2eRollSimulator = () => {
  const [dc, setDc] = useState(15);
  const [modifier, setModifier] = useState(5);
  const [results, setResults] = useState(null);

  const simulateRolls = (iterations = 100000) => {
    let critSuccess = 0, success = 0, failure = 0, critFailure = 0;

    for (let i = 0; i < iterations; i++) {
      let roll = Math.floor(Math.random() * 20) + 1;
      let total;

      if (roll === 1) total = -9 + modifier;
      else if (roll === 20) total = 30 + modifier;
      else total = roll + modifier;

      if (total >= dc + 10) critSuccess++;
      else if (total >= dc) success++;
      else if (total >= dc - 10) failure++;
      else critFailure++;
    }

    setResults({
      critSuccess: Math.round(critSuccess / iterations * 100),
      success: Math.round(success / iterations * 100),
      failure: Math.round(failure / iterations * 100),
      critFailure: Math.round(critFailure / iterations * 100)
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PF2e Roll Simulator</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
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
      </div>
      <Button onClick={() => simulateRolls()}>Run Simulation</Button>
      {results && (
        <div className="mt-4">
          <Card>
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PF2eRollSimulator;

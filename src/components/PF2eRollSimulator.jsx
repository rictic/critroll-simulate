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
      critSuccess: (critSuccess / iterations * 100).toFixed(2),
      success: (success / iterations * 100).toFixed(2),
      failure: (failure / iterations * 100).toFixed(2),
      critFailure: (critFailure / iterations * 100).toFixed(2)
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
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Success</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{results.critSuccess}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Success</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{results.success}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Failure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{results.failure}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Critical Failure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{results.critFailure}%</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PF2eRollSimulator;
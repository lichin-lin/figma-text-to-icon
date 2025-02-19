import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./ui/select";
import React from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

function Panel() {
  const [loading, setLoading] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const [style, setStyle] = React.useState("vector_illustration");
  const [output, setOutput] = React.useState(null);
  const [svgContent, setSvgContent] = React.useState("");

  // pass the result to figma
  const onPasteSVGIntoFigma = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "paste-svg",
          svg: svgContent,
        },
        pluginId: "*",
      },
      "*"
    );
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const getPrediction = async () => {
    setLoading(true);
    setOutput(null);
    const response = await fetch(`/api/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        style,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      alert("Failed to create a prediction");
      return;
    }

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        return;
      }
      console.log(prediction.logs);

      if (prediction.status === "succeeded") {
        setLoading(false);
        setOutput(prediction.output);

        const svgResponse = await fetch(prediction.output);
        const svgText = await svgResponse.text();
        setSvgContent(svgText);
      }
    }
  };

  const OPTIONS = [
    "vector_illustration",
    "vector_illustration/cartoon",
    "vector_illustration/doodle_line_art",
    "vector_illustration/engraving",
    "vector_illustration/flat_2",
    "vector_illustration/kawaii",
    "vector_illustration/line_art",
    "vector_illustration/line_circuit",
    "vector_illustration/linocut",
    "vector_illustration/seamless",
    "icon",
    "icon/broken_line",
    "icon/colored_outline",
    "icon/colored_shapes",
    "icon/colored_shapes_gradient",
    "icon/doodle_fill",
    "icon/doodle_offset_fill",
    "icon/offset_fill",
    "icon/outline",
    "icon/outline_gradient",
    "icon/uneven_fill",
  ];

  return (
    <div className="flex flex-col gap-4 p-2 bg-black/80 h-fit w-[300]">
      {/* result */}
      <div className="relative w-[284px]] h-[284px] rounded-lg">
        {!loading && !output && (
          <div className="rounded-lg w-full h-full [&>svg]:w-full [&>svg]:h-full flex items-center justify-center text-xs bg-white/10 border-2 border-white/20 border-dotted text-white/80 bg-[radial-gradient(rgb(100,100,100)_1px,transparent_1px)] [background-size:16px_16px]">
            👇 Fill in the prompt first.
          </div>
        )}
        {loading && !output && (
          <div className="rounded-lg w-full h-full [&>svg]:w-full [&>svg]:h-full flex items-center justify-center text-xs bg-white/10 border-2 border-white/20 border-dotted text-white/80 bg-[radial-gradient(rgb(100,100,100)_1px,transparent_1px)] [background-size:16px_16px]">
            ✨ Generating...
          </div>
        )}
        {!loading && output && svgContent && (
          <>
            <div
              dangerouslySetInnerHTML={{ __html: svgContent }}
              className="rounded-lg w-full h-auto [&>svg]:w-full [&>svg]:h-full"
            />
            <div className="absolute opacity-0 hover:opacity-100 ease-in duration-100 flex items-center justify-center gap-1 w-full h-full top-0 left-0">
              <button
                className="px-2 py-1 rounded-full backdrop-blur-md bg-black/30 border border-black/10 text-gray-100 w-fit text-xs cursor-pointer"
                id="paste"
                onClick={onPasteSVGIntoFigma}
              >
                Add to Figma
              </button>
            </div>
          </>
        )}
      </div>

      <div className="w-full h-fit flex justify-center mt-2">
        <div className="w-[95%] h-[1px] bg-white/10 rounded-full"></div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full">
        {/* Prompt */}
        <div className="w-full">
          <span className="pl-1 text-xs font-medium text-white/80">Prompt</span>
          <Textarea
            placeholder="Descript your image/icon here."
            className="text-start w-full bg-zinc-800 border-zinc-700 text-xs text-gray-100"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* Style */}
        <div className="w-full">
          <span className="pl-1 text-xs font-medium text-white/80">Style</span>
          <Select onValueChange={(value) => setStyle(value)}>
            <SelectTrigger className="!pr-[4px] w-full bg-zinc-800 border-zinc-700 text-xs text-start text-gray-100">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              {OPTIONS.map((option, key) => {
                const formattedOption = option
                  .replace(/_/g, " ")
                  .replace(/\//g, "-")
                  .replace(/\b\w/g, (char) => char.toUpperCase());
                return (
                  <SelectItem value={option} key={key}>
                    {formattedOption}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <Button
          className="rounded-md w-full cursor-pointer border border-zinc-400"
          id="create"
          onClick={getPrediction}
          disabled={loading}
        >
          {loading ? "Loading... " : "Create"}
        </Button>
      </div>
    </div>
  );
}

export default Panel;

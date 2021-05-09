/**
 * The median order operator orders the bottom layer according to the median of
 * their parent's indices. In many cases this is optimal, and is very fast.
 *
 * <img alt="median example" src="media://two_layer_greedy.png" width="400">
 *
 * @module
 */
import { DagNode } from "../../dag/node";
import { DummyNode } from "../dummy";
import { Operator } from ".";
import { median as arrayMedian } from "d3-array";
import { def } from "../../utils";

export type MedianOperator<NodeType extends DagNode> = Operator<NodeType>;

/** Create a median two layer ordering operator. */
export function median<NodeType extends DagNode>(
  ...args: never[]
): MedianOperator<NodeType> {
  if (args.length) {
    throw new Error(
      `got arguments to median(${args}), but constructor takes no aruguments.`
    );
  }
  function medianCall(
    topLayer: (NodeType | DummyNode)[],
    bottomLayer: (NodeType | DummyNode)[]
  ): void {
    const positions = new Map<NodeType | DummyNode, number[]>();
    for (const [i, node] of topLayer.entries()) {
      for (const child of node.ichildren()) {
        const pos = positions.get(child);
        if (pos) {
          pos.push(i);
        } else {
          positions.set(child, [i]);
        }
      }
    }
    const medians = new Map<NodeType | DummyNode, number>();
    let otherwise = -1;
    for (const node of bottomLayer) {
      const med = arrayMedian(positions.get(node) || []);
      if (med === undefined) {
        medians.set(node, otherwise);
        otherwise =
          +!((otherwise + 1) / (topLayer.length + 1)) * (topLayer.length + 1) -
          1;
      } else {
        medians.set(node, med);
      }
    }
    bottomLayer.sort((a, b) => def(medians.get(a)) - def(medians.get(b)));
  }

  return medianCall;
}

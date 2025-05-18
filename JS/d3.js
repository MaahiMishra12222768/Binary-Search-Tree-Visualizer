export const plot = (treeData, currValue, isInserting) => {
  // Calculate appropriate margins and dimensions
  var margin = { top: 50, right: 10, bottom: 50, left: 10 },
    width = window.innerWidth - margin.left - margin.right - 280 + ((window.innerWidth >= 760) ? 0 : 80),
    height = window.innerHeight - margin.top - margin.bottom - 100;
  
  // Create the tree layout
  var treemap = d3.tree().size([width, height]);
  
  // Create the hierarchical data structure
  var nodes = d3.hierarchy(treeData);
  
  // Apply the tree layout
  nodes = treemap(nodes);
  
  // Create the SVG container with a smoother entrance
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", `translate(${180 +((window.innerWidth >= 760) ? 80 : 10)},${0})`)
    .style("opacity", 0)
    .transition()
    .duration(400)
    .style("opacity", 1);
  
  // Add a subtle grid pattern for depth perception
  const defs = svg.append("defs");
  
  // Create grid pattern
  const pattern = defs.append("pattern")
    .attr("id", "grid")
    .attr("width", 40)
    .attr("height", 40)
    .attr("patternUnits", "userSpaceOnUse");
  
  pattern.append("path")
    .attr("d", "M 40 0 L 0 0 0 40")
    .attr("fill", "none")
    .attr("stroke", "rgba(255, 255, 255, 0.03)")
    .attr("stroke-width", 1);
  
  // Add the grid background to the SVG
  svg.append("rect")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("fill", "url(#grid)");

  // Add a group element for all the tree elements
  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // Add links first (so they appear behind nodes)
  addLink(g, nodes, currValue, isInserting);
  
  // Add nodes
  addNode(g, nodes, currValue, isInserting);
  
  // Add a level indicator for better visualization
  addLevelIndicators(g, nodes, height);
  
  // Add a message for the initial display
  if (isInserting && nodes.descendants().length === 1) {
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("class", "info-text")
      .text(`Initial tree with value: ${currValue}`);
  }
};

function addNode(g, nodes, currValue, isInserting) {
  // Create node groups with staggered animation
  var node = g
    .selectAll(".node")
    .data(nodes.descendants())
    .enter()
    .append("g")
    .attr("class", function (d) {
      return "node" + (d.children ? " node--internal" : " node--leaf") + (d.data.name == currValue ? " recent" : "");
    })
    .attr("transform", function (d) {
      // For newly inserted nodes, start from parent position
      if (isInserting === true && d.parent && d.data.name == currValue) {
        return "translate(" + d.parent.x + "," + d.parent.y + ")";
      } else {
        return "translate(" + d.x + "," + d.y + ")";
      }
    })
    .style("opacity", 0);
  
  // Animate nodes to their final positions with staggered timing
  node
    .transition()
    .duration(800)
    .delay((d, i) => i * 50)
    .attr("transform", d => {
      return "translate(" + d.x + "," + d.y + ")";
    })
    .style("opacity", 1);
  
  // Add shadow effect for depth
  node.append("circle")
    .attr("r", 0)
    .attr("filter", "drop-shadow(0 3px 3px rgba(0,0,0,0.3))")
    .transition()
    .duration(600)
    .delay((d, i) => 200 + i * 50)
    .attr("r", function(d) {
      // Adjust size based on value
      if (d.data.name == currValue) return 5;
      if (Math.abs(d.data.name) > 1000) return 25;
      if (Math.abs(d.data.name) > 100) return 22;
      return 20;
    })
    .transition()
    .duration(function (d) {
      return d.data.name == currValue ? 500 : 0;
    })
    .attr("r", d => {
      // Adjust size for large numbers
      if (Math.abs(d.data.name) > 1000) return 25;
      if (Math.abs(d.data.name) > 100) return 22; 
      return 20;
    });
  
  // Add text labels with fade-in effect
  node
    .append("text")
    .attr("dy", ".35em")
    .attr("y", 0)
    .style("text-anchor", "middle")
    .style("opacity", 0)
    .text(function (d) {
      return d.data.name;
    })
    .transition()
    .duration(400)
    .delay((d, i) => 400 + i * 50)
    .style("opacity", 1);
  
  // Add a subtle highlight effect to the current node
  if (currValue !== undefined && currValue !== null) {
    node.filter(d => d.data.name == currValue)
      .append("circle")
      .attr("r", 30)
      .attr("class", "highlight-pulse")
      .style("fill", "rgba(138, 43, 226, 0.2)")
      .style("stroke", "none")
      .style("opacity", 0.7)
      .transition()
      .duration(1000)
      .attr("r", 35)
      .style("opacity", 0)
      .on("end", function() {
        d3.select(this).remove();
      });
  }
}

function addLink(g, nodes, currValue, isInserting) {
  // Skip links if there's only one node (root node)
  if (nodes.descendants().length <= 1) return;
  
  // Create links
  var link = g
    .selectAll(".link")
    .data(nodes.descendants().slice(1)) // Skip the root node
    .enter()
    .append("path")
    .attr("class", function (d) {
      return "link" + (d.data.name == currValue ? " recent" : "");
    })
    .style("opacity", 0)
    .attr("d", function (d) {
      let s;
      // For newly inserted nodes, start link from parent position
      if (isInserting === true && d.data.name == currValue) {
        s = (
          "M" +
          d.parent.x +
          "," +
          d.parent.y +
          "C" +
          d.parent.x +
          "," +
          d.parent.y +
          " " +
          d.parent.x +
          "," +
          d.parent.y +
          " " +
          d.parent.x +
          "," +
          d.parent.y
        );
      }
      else {
        s = (
          "M" +
          d.parent.x +
          "," +
          d.parent.y +
          "C" +
          d.parent.x +
          "," +
          (d.y + d.parent.y) / 2 +
          " " +
          d.x +
          "," +
          (d.y + d.parent.y) / 2 +
          " " +
          d.x +
          "," +
          d.y
        );
      }
      return s;
    });
  
  // Animate links to their final positions with a fade-in effect
  link
    .transition()
    .duration(800)
    .delay((d, i) => i * 30)
    .style("opacity", 1)
    .attr("d", function (d) {
      let s = (
        "M" +
        d.parent.x +
        "," +
        d.parent.y +
        "C" +
        d.parent.x +
        "," +
        (d.y + d.parent.y) / 2 +
        " " +
        d.x +
        "," +
        (d.y + d.parent.y) / 2 +
        " " +
        d.x +
        "," +
        d.y
      );
      return s;
    });
}

function addLevelIndicators(g, nodes, height) {
  // Find the maximum depth of the tree
  const maxDepth = Math.max(...nodes.descendants().map(d => d.depth));
  
  // Only add level indicators if there are multiple levels
  if (maxDepth > 0) {
    // Create an array of unique depths
    const depths = [...new Set(nodes.descendants().map(d => d.depth))];
    
    // Add subtle level lines
    depths.forEach(depth => {
      const yPosition = (height / (maxDepth + 1)) * depth;
      
      g.append("line")
        .attr("x1", 0)
        .attr("y1", yPosition)
        .attr("x2", g.node().getBBox().width)
        .attr("y2", yPosition)
        .attr("stroke", "rgba(255, 255, 255, 0.05)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .delay(800)
        .style("opacity", 1);
      
      // Add level label
      g.append("text")
        .attr("x", 10)
        .attr("y", yPosition - 5)
        .attr("text-anchor", "start")
        .attr("font-size", "12px")
        .attr("fill", "rgba(255, 255, 255, 0.4)")
        .text(`Level ${depth}`)
        .style("opacity", 0)
        .transition()
        .duration(800)
        .delay(1000)
        .style("opacity", 1);
    });
  }
}

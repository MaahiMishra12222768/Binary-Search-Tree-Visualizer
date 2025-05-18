export const plot = (treeData, currValue, isInserting) => {
  // Calculate appropriate margins and dimensions
  var margin = { top: 50, right: 10, bottom: 50, left: 10 },
    width = window.innerWidth - margin.left - margin.right - 250 + ((window.innerWidth >= 760) ? 0 : 70),
    height = window.innerHeight - margin.top - margin.bottom - 100;
  
  // Create the tree layout
  var treemap = d3.tree().size([width, height]);
  
  // Create the hierarchical data structure
  var nodes = d3.hierarchy(treeData);
  
  // Apply the tree layout
  nodes = treemap(nodes);
  
  // Create the SVG container
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", `translate(${150 +((window.innerWidth >= 760) ? 80 : 10)},${0})`);
  
  // Add a group element for all the tree elements
  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // Add links first (so they appear behind nodes)
  addLink(g, nodes, currValue, isInserting);
  
  // Add nodes
  addNode(g, nodes, currValue, isInserting);
  
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
  // Create node groups
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
    });
  
  // Animate nodes to their final positions
  node
    .transition()
    .duration(1000)
    .attr("transform", d => {
      return "translate(" + d.x + "," + d.y + ")";
    });
  
  // Add circles for nodes
  node.append("circle")
    .attr("r", function (d) {
      // Smaller initial size for the highlighted node
      return d.data.name == currValue ? 5 : 20;
    })
    .transition()
    .duration(function (d) {
      return d.data.name == currValue ? 500 : 0;
    })
    .attr("r", d => {
      // Adjust size for large numbers
      if(Math.abs(d.data.name) > 1000) return 25;
      return 20;
    });
  
  // Add text labels
  node
    .append("text")
    .attr("dy", ".35em")
    .attr("y", 0)
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.data.name;
    });
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
  
  // Animate links to their final positions
  addLinkTransition(link, currValue);
}

function addLinkTransition(link, currValue) {
  link.transition()
    .duration(1000)
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

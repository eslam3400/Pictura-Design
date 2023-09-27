"use client"
import React, { useRef, useEffect, useState } from 'react';
import { Grid } from '@mui/material';

export default function Home() {
  const canvasRef = useRef(null);
  const [elements, setElements]: any = useState([]);
  const [selectedElement, setSelectedElement]: any = useState(null);
  const [rotation, setRotation] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [color, setColor] = useState("#000000")

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    const canvas: any = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    elements?.forEach((element: any, index: number) => {
      context.fillStyle = element.color;
      context.save();
      context.translate(element.x, element.y);
      context.rotate(element.rotation);
      if (element.image) {
        context.drawImage(element.image, -element.width / 2, -element.height / 2, element.width, element.height);
      } else {
        context.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
      }
      context.restore();
    });

    if (selectedElement) {
      // Draw selection handles
      const { x, y, width, height } = selectedElement;
      context.strokeStyle = 'orange';
      context.lineWidth = 1;
      context.strokeRect(x - width / 2, y - height / 2, width, height);

      // Draw resize handle
      context.fillStyle = 'blue';
      context.fillRect(x + width / 2 - 5, y + height / 2 - 5, 10, 10);

      // Draw rotation handle
      const rotationHandleX = x + width / 2;
      const rotationHandleY = y - height / 2 - 20;
      context.beginPath();
      context.arc(rotationHandleX, rotationHandleY, 5, 0, Math.PI * 2);
      context.closePath();
      context.fillStyle = 'blue';
      context.fill();
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [elements, selectedElement]);

  const handleAddElement = () => {
    // Add a new element to the state
    setElements((prev: any) => [
      ...elements ?? [],
      {
        x: Math.random() * 200, // Random x position
        y: Math.random() * 200, // Random y position
        width: 50, // Width of the shape
        height: 50, // Height of the shape
        color: color, // Color of the shape
        id: (prev?.length ?? 0) + 1
      },
    ]);
  };

  const handleDeleteElement = () => {
    setElements((prev: any) => {
      if (prev.length == 0 || !selectedElement) return prev;
      return prev.filter((x: any) => x.id !== selectedElement.id);
    });
  };

  const getSelectedElement = (e: any) => {
    const canvas: any = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find the element that was clicked
    return elements?.find((element: any) => {
      const { x, y, width, height, image } = element;
      if (image) {
        return mouseX > x - width && mouseX < x + width && mouseY > y - height && mouseY < y + height;
      }
      return mouseX > x - width / 2 && mouseX < x + width / 2 && mouseY > y - height / 2 && mouseY < y + height / 2;
    });
  }

  const handleRotation = (e: any) => {
    const value = +e.target.value;
    setRotation(value);
    setElements((prev: any) => {
      const selected = prev?.find((x: any) => x.id == selectedElement.id);
      if (!selected) return;
      selected.rotation = value;
      return [...prev];
    })
  }

  const handleResize = (e: any) => {
    const prop = e.target.name;
    const value = +e.target.value;
    setSize((prev: any) => {
      prev[prop] = value;
      return { ...prev }
    });
    setElements((prev: any) => {
      const selected = prev?.find((x: any) => x.id == selectedElement.id);
      if (!selected) return;
      selected[prop] = value;
      return [...prev];
    })
  }

  const handleMouseDown = (e: any) => {
    setSelectedElement(getSelectedElement(e))
  };

  const handleKeyDown = (e: any) => {
    const { key } = e;
    const moveAmount = 1;

    setElements((prev: any) => {
      const selected = prev?.find((x: any) => x.id == selectedElement?.id);
      if (!selected) return prev;
      switch (key) {
        case 'ArrowUp':
          selected.y -= moveAmount;
          break;
        case 'ArrowDown':
          selected.y += moveAmount;
          break;
        case 'ArrowLeft':
          selected.x -= moveAmount;
          break;
        case 'ArrowRight':
          selected.x += moveAmount;
          break;
        default:
          break;
      }
      return [...prev];
    })
  }

  const handleClear = (e: any) => {
    setElements([]);
  }

  const handleColor = (e: any) => {
    setColor(e.target.value);
    if (!selectedElement) return;
    setElements((prev: any) => {
      const selected = prev.find((x: any) => x.id === selectedElement?.id);
      if (!selected) return prev;
      selected.color = color;
      return [...prev];
    })
  }

  const handleImageUpload = (event: any) => {
    const image: any = new Image();

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        image.onload = () => {
          setElements((prev: any) => [
            ...elements ?? [],
            {
              x: 200, // Random x position
              y: 200, // Random y position
              width: 50, // Width of the shape
              height: 50, // Height of the shape
              color: color, // Color of the shape
              id: (prev?.length ?? 0) + 1,
              image: image
            },
          ]);
        };
        // Set the image source to the uploaded image data
        image.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <canvas
          ref={canvasRef}
          width={500} // Set the desired width of the canvas
          height={500} // Set the desired height of the canvas
          style={{ border: '1px solid black' }}
          onMouseDown={handleMouseDown}
        />
        Add Image: <input type='file' accept='image/*' onChange={handleImageUpload} /><br />
        <button onClick={handleAddElement}>Add Element</button><br />
        <button onClick={handleDeleteElement}>delete Element</button><br />
        <button onClick={handleClear}>Clear</button><br />
        Color: <input type="color" style={{ border: "solid black 1px" }} value={selectedElement?.color ?? "#000000"} onChange={handleColor} /> <br />
        Rotation: <input type="number" style={{ border: "solid black 1px" }} step=".1" value={selectedElement?.rotation ?? 0} onChange={handleRotation} /> <br />
        Width: <input type="number" name="width" style={{ border: "solid black 1px" }} value={selectedElement?.width ?? 0} onChange={handleResize} /> <br />
        Hight: <input type="number" name="height" style={{ border: "solid black 1px" }} value={selectedElement?.height ?? 0} onChange={handleResize} /> <br />
      </Grid>

      <Grid item xs={4}>
        <div style={{ backgroundColor: 'lightgreen', height: '100px' }}>
          Column 2
        </div>
      </Grid>

      <Grid item xs={4}>
        <div style={{ backgroundColor: 'lightcoral', height: '100px' }}>
          Column 3
        </div>
      </Grid>
    </Grid>
  )
}

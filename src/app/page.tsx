"use client"
import React, { useRef, useEffect, useState } from 'react';
import { Grid } from '@mui/material';

export default function Home() {
  const canvasRef = useRef(null);
  const [elements, setElements]: any = useState([]);
  const [rotation, setRotation] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [color, setColor] = useState("#000000")
  const [design, setDesign] = useState("/t-shirt.png");
  const [designImage, setDesignImage]: any = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    (async () => {
      const canvas: any = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      let element = {
        width: canvas.width - 20,
        height: canvas.height - 20,
        x: canvas.width / 2,
        y: canvas.height / 2,
        image: design,
      }
      const image = await loadImage(element);
      context.drawImage(image, 10, 10, element.width, element.height);
      setDesignImage({ ...element, image });
    })()
  }, [design]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    const canvas: any = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(designImage?.image ?? new Image(), 10, 10, designImage?.width ?? 0, designImage?.height ?? 0);
    for (const element of elements) {
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

      if (element.isSelected) {
        // Draw selection handles
        const { x, y, width, height } = element;
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
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [elements]);

  async function loadImage(element: any) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = element.image

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load the image.'));
    });
  }

  const handleAddElement = () => {
    setElements((prev: any) => [
      ...elements ?? [],
      {
        x: Math.random() * 200,
        y: Math.random() * 200,
        width: 50,
        height: 50,
        color: color,
        id: (prev?.length ?? 0) + 1,
        isSelected: false
      },
    ]);
  };

  const handleDeleteElement = () => {
    setElements((prev: any) => {
      if (prev.length == 0) return prev;
      return prev.filter((x: any) => !x.isSelected);
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
      const selected = prev?.find((x: any) => x.isSelected);
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
      const selected = prev?.find((x: any) => x.isSelected);
      if (!selected) return;
      selected[prop] = value;
      return [...prev];
    })
  }

  const handleClick = (e: any) => {
    setElements((prev: any) => {
      const elementsWithoutSelection = elements.map((x: any) => {
        x.isSelected = false;
        return x;
      });
      const selected = getSelectedElement(e);
      if (!selected) {
        return elementsWithoutSelection;
      } else {
        selected.isSelected = true;
        return [...elementsWithoutSelection, selected];
      }
    })
  };

  const handleMouseDown = (e: any) => {
    setIsDragging(true);
  }

  const handleMouseUp = (e: any) => {
    setIsDragging(false);
  }

  const handleMouseMove = (e: any) => {
    const canvas: any = canvasRef.current;
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    if (isDragging) {
      setElements((prev: any) => {
        if (prev.length == 0) return prev;
        const dragged = { ...prev.find((x: any) => x.isSelected) };
        const notSelected = prev.filter((x: any) => !x.isSelected);
        if (!dragged) return prev;
        dragged.x = mouseX;
        dragged.y = mouseY;
        return [...notSelected, dragged];
      });
    }
  }

  const handleKeyDown = (e: any) => {
    const { key } = e;
    const moveAmount = 1;

    setElements((prev: any) => {
      const selected = prev?.find((x: any) => x.isSelected);
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
    setElements((prev: any) => {
      const selected = prev.find((x: any) => x.isSelected);
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

  function handleChangeDesign() {
    setDesign("/t-shirt2.png")
    setElements((prev: any) => ([...prev]));
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <canvas
          ref={canvasRef}
          width={500} // Set the desired width of the canvas
          height={500} // Set the desired height of the canvas
          style={{ border: '1px solid black' }}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />
        Add Image: <input type='file' accept='image/*' onChange={handleImageUpload} /><br />
        <button onClick={handleChangeDesign}>Change Design</button><br />
        <button onClick={handleAddElement}>Add Element</button><br />
        <button onClick={handleDeleteElement}>Delete Element</button><br />
        <button onClick={handleClear}>Clear</button><br />
        Color: <input type="color" style={{ border: "solid black 1px" }} value={elements?.find((x: any) => x.isSelected)?.color ?? "#000000"} onChange={handleColor} /> <br />
        Rotation: <input type="number" style={{ border: "solid black 1px" }} step=".1" value={elements?.find((x: any) => x.isSelected)?.rotation ?? 0} onChange={handleRotation} /> <br />
        Width: <input type="number" name="width" style={{ border: "solid black 1px" }} value={elements?.find((x: any) => x.isSelected)?.width ?? 0} onChange={handleResize} /> <br />
        Hight: <input type="number" name="height" style={{ border: "solid black 1px" }} value={elements?.find((x: any) => x.isSelected)?.height ?? 0} onChange={handleResize} /> <br />
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

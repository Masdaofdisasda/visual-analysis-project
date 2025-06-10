import {useEffect, useState} from "react";
import {GraphModel, loadGraphModel} from "@tensorflow/tfjs";

/**
 * Custom hook to load a TensorFlow.js graph model and manage its state.
 * This hook handles the asynchronous loading of the model and provides its instance along with a loading state.
 *
 * @returns - An object containing:
 *   - model - The loaded TensorFlow.js graph model, or `null` if not yet loaded.
 *   - loading - A flag indicating whether the model is currently being loaded.
 */
function useTfjsModel() {
    const [model, setModel] = useState<GraphModel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(function handleLoadGraphModel() {
        async function loadModel() {
        try {
            const model = await loadGraphModel('tfjs_model/model.json');
            setModel(model);
        } catch (error) {
            console.error('Error loading model:', error);
        } finally {
            setLoading(false);
        }
        }

        loadModel();
    }, []);

    return { model, loading };
}

export default useTfjsModel;

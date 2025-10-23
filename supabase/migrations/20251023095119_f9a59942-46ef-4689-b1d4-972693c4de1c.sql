CREATE OR REPLACE FUNCTION public.delete_employee_document(p_employee_id uuid, p_document_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_documents jsonb;
  v_filtered_documents jsonb;
BEGIN
  -- Get the current documents array
  SELECT documents INTO v_documents
  FROM document_tracker
  WHERE employee_id = p_employee_id;
  
  -- If no documents found, nothing to delete
  IF v_documents IS NULL THEN
    RETURN;
  END IF;
  
  -- Filter out the document with matching id
  SELECT jsonb_agg(doc)
  INTO v_filtered_documents
  FROM jsonb_array_elements(v_documents) AS doc
  WHERE (doc->>'id')::uuid != p_document_id;
  
  -- If no documents remain after filtering, delete the entire row
  IF v_filtered_documents IS NULL OR jsonb_array_length(v_filtered_documents) = 0 THEN
    DELETE FROM document_tracker
    WHERE employee_id = p_employee_id;
  ELSE
    -- Otherwise, update with the filtered documents array
    UPDATE document_tracker
    SET documents = v_filtered_documents,
        updated_at = now()
    WHERE employee_id = p_employee_id;
  END IF;
END;
$function$;